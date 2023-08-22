#include "libgrade.h"

int init(void) {
    return 12;
}

vl solve(ll n) {
    if (n == 1) return vl{1};
    vl sub = solve(n >> 1);

    vl ret(n);
    for (ll i = 0; i < n; ++i) {
        if (i % 2 == 0) {
            ret[i] = sub[i / 2];
        }
        else {
            ret[i] = n - (sub[i / 2] - 1);
        }
    }

    return ret;
}

bool ok(int n, opipe& out, ipipe& in) {
    ll N = (1 << (n + 5));

    out << N << '\n';
    out.flush();

    vl comp = solve(N);

    for (int i = 0; i < N; ++i) {
        ll tmp;
        in >> tmp;
        if (comp[i] != tmp) return false;
    }

    return true;
}