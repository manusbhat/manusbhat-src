//
// Created by Manu Bhat on 8/8/23.
//

#pragma once

#include <bits/stdc++.h>
#include <unistd.h>
#include <sys/resource.h>
#ifdef __linux
#include <seccomp.h>
#endif

using namespace std;

/* helper methods for generating test cases */
#include "tcutil.h"

/* io based off of {https://stackoverflow.com/a/33759060}, adapted to process fds */
constexpr int buffer_size = 2048;
constexpr int read_size   = 2048;
class stdiobuf: public streambuf {
    char obuffer[buffer_size];
    char ibuffer[buffer_size];
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
        size_t ret = read(this->fp, this->ibuffer, read_size);

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
    stdiobuf(int fp) : fp(fp) {
        this->setp(this->obuffer, this->obuffer + buffer_size);
        this->setg(this->ibuffer, this->ibuffer, this->ibuffer);
    }

    ~stdiobuf() {
        this->sync();
        close(this->fp);
    }
};

class opipe: private virtual stdiobuf, public std::ostream {
public:
    opipe(int fp) : stdiobuf(fp)
            , std::ios(static_cast<std::streambuf*>(this))
            , std::ostream(static_cast<std::streambuf*>(this)) {
    }
};

class ipipe: private virtual stdiobuf, public std::istream {
public:
    ipipe(int fp) : stdiobuf(fp)
            , std::ios(static_cast<std::streambuf*>(this))
            , std::istream(static_cast<std::streambuf*>(this)) {
    }
};

void handle_timeout(int signum) {
    exit(-1);
}

// https://github.com/vi/syscall_limiter/blob/master/writelimiter/popen2.c
tuple<int, int, int> popen2(
        char const *arg,
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

        // map stdout
        close(pipe_stdout[0]);
        dup2(pipe_stdout[1], STDOUT_FILENO);

#ifdef __linux
        // give a bit more time than strictly necessary before timing out
        struct rlimit time_limit;
        time_limit.rlim_cur = time_limit.rlim_max = 2 * (ms_limit + 999) / 1000;
        setrlimit(RLIMIT_CPU, &time_limit);

        struct rlimit mem_limit;
        mem_limit.rlim_cur = mem_limit.rlim_max = kb_limit * 1024;
        setrlimit(RLIMIT_AS, &mem_limit);
#endif

#ifndef __linux
        // timeout (macOS)
        signal(SIGALRM, handle_timeout);
        alarm(2 * (ms_limit + 999) / 1000);

        execl(arg, arg, NULL);
#else
        execl("firejail", "firejail", "--quiet", "--private", "--net=none", "--noroot", arg, NULL);
#endif

        exit(-1);
    }

    // not used on parent process
    close(pipe_stdin[0]);
    close(pipe_stdout[1]);

    return make_tuple(pipe_stdin[1], pipe_stdout[0], p);
}

/* abstract methods */
int num(void);
bool ok(int n, opipe& mout, ipipe& min);

/* internal helpers */
#define RESULT(num, status, memory, time) cout << num << " " << status << " " << memory << " " << time << endl
#define GNU_GXX20 "GNU G++20"

/* language, mb_limit, ms_limit */
enum _status {
    _LOADING = -2,
    _COMPILATION_ERROR = -1,
    _SUCCESS = 0,
    _WRONG_ANSWER = 1,
    _TIMED_OUT = 2,
    _RUNTIME_ERROR = 3,
};

int main(int argc, char const* argv[]) {
    assert(argc == 4);
    char const* const language = argv[1];
    int const kb_limit = atoi(argv[2]);
    int const ms_limit = atoi(argv[3]);

    int const n = num();
    cout << n << endl;

    if (!strcmp(language, GNU_GXX20)) {
        /* compile */
        if (system("g++ -O3 --std=c++20 -o main.o main.cpp &>/dev/null") != 0) {
            goto compilation_error;
        }
    }
    else {
        goto compilation_error;
    }

    for (int i = 0; i < n; ++i) {
        srand(i + 2); // avoid special value

        char const *command;
        if (!strcmp(language, GNU_GXX20)) {
            command = "./main.o";
        }
        else {
            goto compilation_error;
        }

        int pin, pout, pid;
        tie(pin, pout, pid) = popen2(command, kb_limit, ms_limit);
        opipe mout(pin);
        ipipe min(pout);

        auto start = std::chrono::high_resolution_clock::now();
        bool const correct = ok(i, mout, min);
        auto finish = std::chrono::high_resolution_clock::now();
        auto ms = chrono::duration_cast<chrono::milliseconds>(finish - start);

        if (ms.count() > ms_limit) {
            RESULT(i, _TIMED_OUT, 0, 0);
            continue;
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

    return 0;

compilation_error:
    for (int i = 0; i < n; ++i) {
        RESULT(i, _COMPILATION_ERROR, 0, 0);
    }

    return 0;
}

#undef GNU_GXX20
#undef RESULT