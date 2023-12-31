//
// Created by Manu Bhat on 8/8/23.
//

// UPDATES TO ANY LIBGRADE REQUIRE A FULL CLEAN OF GRADER CACHES

#pragma once

#include <bits/stdc++.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/resource.h>
#include <sys/wait.h>
#include <sys/stat.h>
#ifdef __linux
#include <seccomp.h>
#endif

using namespace std;


#define BUFFER_SIZE (1 << 10)
#define READ_SIZE (1 << 10)

#define RESULT(num, status, memory, time) cout << num << " " << status << " " << memory << " " << time << endl

#define GNU_GXX20 "GNU G++20"
#define PYTHON3 "Python 3.11"
#define JAVA17 "Java 17"

class _stdiobuf;
class opipe;
class ipipe;

/* abstract methods */
int init(void); // returns number of test cases
bool ok(int n, opipe& out, ipipe& in);


/* io based off of {https://stackoverflow.com/a/33759060}, adapted to process fds */
class _stdiobuf: public streambuf {
    char* obuffer;
    char* ibuffer;
    int fp;

    int overflow(int c) {
        if (c != std::char_traits<char>::eof()) {
            *this->pptr() = std::char_traits<char>::to_char_type(c);
            this->pbump(1);
        }

        return this->sync()
            ? std::char_traits<char>::eof()
            : std::char_traits<char>::not_eof(c);
    }

    int underflow(void) {
        size_t ret = read(this->fp, this->ibuffer, READ_SIZE);

        // finish?
        if (ret == 0) {
            return std::char_traits<char>::eof();
        }

        setg(this->eback(), this->eback(), this->eback() + ret);
        return std::char_traits<char>::to_int_type(*this->gptr());
    }

    int osync() {
        std::streamsize size(this->pptr() - this->pbase());
        if (!size) return 0;

        std::streamsize done(write(this->fp, this->pbase(), size));
        this->setp(this->pbase(), this->epptr());
        return size == done ? 0 : -1;
    }

    int sync() {
        return osync();
    }

public:
    _stdiobuf(int fp) : fp(fp) {
        this->obuffer = new char[BUFFER_SIZE];
        this->ibuffer = new char[BUFFER_SIZE];
        this->setp(this->obuffer, this->obuffer + BUFFER_SIZE - 1);
        this->setg(this->ibuffer, this->ibuffer, this->ibuffer);
    }

    ~_stdiobuf() {
        this->sync();
        delete[] this->obuffer;
        delete[] this->ibuffer;
        close(this->fp);
    }
};

class opipe: private virtual _stdiobuf, public std::ostream {
public:
    opipe(int fp) : _stdiobuf(fp)
            , std::ios(static_cast<std::streambuf*>(this))
            , std::ostream(static_cast<std::streambuf*>(this)) {
    }
};

class ipipe: private virtual _stdiobuf, public std::istream {
public:
    ipipe(int fp) : _stdiobuf(fp)
            , std::ios(static_cast<std::streambuf*>(this))
            , std::istream(static_cast<std::streambuf*>(this)) {
    }
};

enum _status {
    _LOADING = -2,
    _COMPILATION_ERROR = -1,
    _SUCCESS = 0,
    _WRONG_ANSWER = 1,
    _TIMED_OUT = 2,
    _RUNTIME_ERROR = 3,
};

static void _setup_signals(void) {
    signal(SIGPIPE, SIG_IGN);
}

static void _compile(char const *language, int n) {
    if (!strcmp(language, GNU_GXX20)) {
        /* compile */
        if (system("g++ -O3 --std=c++20 -o main.o main.cpp >/dev/null") != 0) {
            goto compilation_error;
        }
        //linux is stupid for some reason, need this to reload the file cache?
#ifdef __linux
        sleep(4);
#endif
    }
    else if (!strcmp(language, JAVA17)) {
        if (system("javac main.java >/dev/null") != 0) {
            goto compilation_error;
        }

#ifdef __linux
        sleep(4);
#endif
    }
    else if (!strcmp(language, PYTHON3)) {
        /* no compilation required */
    }
    else {
        goto compilation_error;
    }

    return;

compilation_error:
    for (int i = 0; i < n; ++i) {
        RESULT(i, _COMPILATION_ERROR, 0, 0);
    }

    exit(0);
}


static int _child_stdin; // for child process (process_in)
static char _child_dump[BUFFER_SIZE];
static void _handle_child_timeout(int signum) {
    while (read(_child_stdin, _child_dump, BUFFER_SIZE) == BUFFER_SIZE); // allow buffer to proceed
    exit(-1);
}

// https://github.com/vi/syscall_limiter/blob/master/writelimiter/popen2.c
static tuple<int, int, int> _popen2(
        char const *language,
        int kb_limit,
        int ms_limit
) {
    int pipe_stdin[2], pipe_stdout[2];
    if(pipe(pipe_stdin) || pipe(pipe_stdout)) return make_tuple(-1, -1, -1);

    pid_t p = fork();
    if(p < 0) return make_tuple(p, p, p); /* Fork failed */
    if(p == 0) { /* child */

        // map stdin to pipe we just created
        close(pipe_stdin[1]);
        dup2(pipe_stdin[0], STDIN_FILENO);
        _child_stdin = pipe_stdin[0];

        // map stdout
        close(pipe_stdout[0]);
        dup2(pipe_stdout[1], STDOUT_FILENO);

#ifdef __linux
        // map stderr (on macos keep it for debug)
        freopen("/dev/null", "w", stderr);
#endif


#ifdef __linux
        struct rlimit mem_limit;
        mem_limit.rlim_cur = mem_limit.rlim_max = kb_limit * 1024;
        setrlimit(RLIMIT_AS, &mem_limit);
#endif

        struct rlimit stack_limit;
        stack_limit.rlim_cur = stack_limit.rlim_max = kb_limit * 1024;
        setrlimit(RLIMIT_STACK, &stack_limit);

        signal(SIGALRM, _handle_child_timeout);
        alarm( (ms_limit + 1000) / 1000); // give an extra second to avoid slight discrepencies

#ifdef __linux
        #define EXECL(command, ...) execl( \
            "/usr/bin/firejail", "/usr/bin/firejail", "--quiet", "--private", "--net=none", "--noroot", \
            command, __VA_ARGS__           \
        );
#else
        /* macos */
#define EXECL(command, ...) execl(command, \
            command, __VA_ARGS__           \
        );
#endif

        if (!strcmp(language, GNU_GXX20)) {
            EXECL("./main.o", NULL);
        }
        else if (!strcmp(language, JAVA17)) {
            // stack size set to 64 mb, should be enough generally
            EXECL("/usr/bin/java", "-Xss64m", "main", NULL);
        }
        else if (!strcmp(language, PYTHON3)) {
#ifdef __linux
            EXECL("/usr/bin/python3", "main.py", NULL);
#else
            EXECL("/usr/local/bin/python3", "main.py", NULL);
#endif
        }

        exit(-1); // error
    }

    // not used on parent process
    close(pipe_stdin[0]);
    close(pipe_stdout[1]);

    return make_tuple(pipe_stdin[1], pipe_stdout[0], p);
}

static void _grade(int i, char const *language, int kb_limit, int ms_limit) {
    srand(i + 2); // avoid special value

    int pin, pout, pid;
    tie(pin, pout, pid) = _popen2(language, kb_limit, ms_limit);
    opipe out(pin);
    ipipe min(pout);

    auto start = std::chrono::high_resolution_clock::now();
    bool const correct = ok(i, out, min) && !min.fail();
    auto finish = std::chrono::high_resolution_clock::now();
    auto ms = chrono::duration_cast<chrono::milliseconds>(finish - start);

    if (ms.count() > ms_limit) {
        RESULT(i, _TIMED_OUT, 0, 0);
        return;
    }
    else {
        int sp_status;
        struct rusage usage;
        wait4(pid, &sp_status, 0, &usage);

        if (correct) {
            int kb;
#ifdef __linux
            /* linux */
            kb = usage.ru_maxrss;
#else
            /* mac os */
            kb = usage.ru_maxrss / 1024;
#endif

            RESULT(i, _SUCCESS, kb, ms.count());
        }
        else if (!WIFEXITED(sp_status) || WEXITSTATUS(sp_status) != 0) {
            RESULT(i, _RUNTIME_ERROR, 0, 0);
        }
        else {
            RESULT(i, _WRONG_ANSWER, 0, 0);
        }
    }
}

int main(int argc, char const* argv[]) {
    assert(argc == 4);
    char const* const language = argv[1];
    int const kb_limit = atoi(argv[2]);
    int const ms_limit = atoi(argv[3]);

    int const n = init();
    cout << n << endl;

    init();
    _setup_signals();
    _compile(language, n);

    for (int i = 0; i < n; ++i) {
        _grade(i, language, kb_limit, ms_limit);
    }

    return 0;
}

#undef BUFFER_SIZE
#undef READ_SIZE
#undef GNU_GXX20
#undef JAVA17
#undef PYTHON3
#undef RESULT

/* helper methods for generating test cases */
#include "tcutil.h"
