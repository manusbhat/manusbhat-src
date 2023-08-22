#include "libgrade.h"

int init(void) {
    return 12;
}

ll solve(const vl& string) {
    ll index ;
    for (index = 0; index < string.size() && string[index] == 1; ++index);
    for (; index < string.size() && string[index] == 0; ++index);

    return index;
}

bool ok(int n, opipe& out, ipipe& in) {
    ll s = n * n * 1000 + 1;
    ll e = (n + 1) * (n + 1) * 1000;
    ll N = randl(min(s, (ll) (1e5 - 1e4)), min(e, (ll) 1e5));

    vl bitstring;

    if (n == 9) {
        bitstring = vl(N, 0);
    }
    else if (n == 10) {
        bitstring = vl(N, 1);
    }
    else if (n == 11) {
        bitstring = vl(N, 0);
        fill(bitstring.begin() + randl(3, N), bitstring.end(), 1);
    }
    else {
        bitstring = randvl(N, 0, 2);
    }

    out << N << '\n';
    for (ll q: bitstring) out << q;
    out << '\n';
    out.flush();

    ll comp = solve(bitstring);
    ll ans;
    in >> ans;

    return ans == comp;
}