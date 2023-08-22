#include "libgrade.h"

int init(void) {
    return 12;
}

ll solve(ll C, ll V, vl& x, vl& y) {
    vl diff;
    for (int i = 0; i < C + V; ++i) diff.emplace_back(y[i] - x[i]);
    sort(diff.begin(), diff.end());

    return accumulate(x.begin(), x.end(), 0ll) + accumulate(diff.begin() + C, diff.end(), 0ll);
}

bool ok(int n, opipe& out, ipipe& in) {
    ll s = n * n * 1000 + 1;
    ll e = (n + 1) * (n + 1) * 1000;
    ll C = randl(min(s, (ll) (4e4)), min(e, (ll) 5e4));
    ll V = randl(min(s, (ll) (4e4)), min(e, (ll) 5e4));

    if (n == 0) C = 0;
    if (n == 1) V = 0;

    vl x, y;

    if (n == 6) {
        // x always larger
        x = vl(C + V, 1e3);
        y = vl(C + V, 0);
    }
    else if (n == 7) {
        // y always larger
        x = vl(C + V, 0);
        y = vl(C + V, 1e3);
    }
    else if (n == 8) {
        x = y = vl(C + V, 0);
    }
    else {
        x = randvl(C + V, -1e4, 1e4 + 1);
        y = randvl(C + V, -1e4, 1e4 + 1);
    }

    out << C << ' ' << V << '\n';
    for (ll xp: x) out << xp << ' ';
    out << '\n';
    for (ll yp: y) out << yp << ' ';
    out << '\n';
    out.flush();

    ll comp = solve(C, V, x, y);
    ll ans;
    in >> ans;

    return ans == comp;
}