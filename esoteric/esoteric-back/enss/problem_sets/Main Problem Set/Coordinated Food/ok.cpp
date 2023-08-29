#include "libgrade.h"

int init(void) {
    return 12;
}

ll gcd(ll a, ll b) {
    if (a < 0) a = -a;
    if (b < 0) b = -b;
    if (a < b) return gcd(b, a);
    if (b == 0) return a;
    return gcd(b, a % b);
}

ll solve(vl& x, vl& s) {
    vl diff(x.size());

    ll g = 0;
    for (int i = 0; i < x.size(); ++i) diff[i] = s[i] - x[i];
    for (int i = 0; i < x.size(); ++i) g = gcd(g, diff[i]);

    if (g == 0) return 0;

    ll mpos = 0;
    for (int i = 0; i < x.size(); ++i) mpos = max(mpos, diff[i] / g);
    ll mneg = 0;
    for (int i = 0; i < x.size(); ++i) mneg = max(mneg, -diff[i] / g);

    return min(mpos, mneg) + mpos + mneg;
}

bool ok(int n, opipe& out, ipipe& in) {

    ll a = n * n * 1000;
    ll e = (n + 1) * (n + 1) * 1000;
    ll N = randl(min(a, (ll) 4e4), min(e, (ll) 5e4));
    // gcd
    ll G = randl(1, 1e8);
    vl x = randvl(N, 0, 1e8);
    vl steps = randvl(N, -1e9 / G, (1e9 + G - 1) / G);
    vl s(N);

    if (n < 2) {
        for (int i = 0; i < N; ++i) steps[i] = max(steps[i], 0ll);
    }
    else if (n < 4) {
        for (int i = 0; i < N; ++i) steps[i] = min(steps[i], 0ll);
    }

    for (int i = 0; i < N; ++i) s[i] = x[i] + steps[i] * G;

    out << N << '\n';
    for (int i = 0; i < N; ++i) out << x[i] << ' ';
    out << '\n';
    for (int i = 0; i < N; ++i) out << s[i] << ' ';
    out << '\n';
    out.flush();

    ll ans = solve(x, s);
    ll pred;
    in >> pred;

    return ans == pred;
}