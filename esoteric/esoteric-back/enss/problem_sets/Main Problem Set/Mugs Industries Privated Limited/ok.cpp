#include "libgrade.h"

int init(void) {
    return 12;
}

vl solve(ll D, ll K, const vl &p, const vl &r) {
    vl out;
    // can be done in many ways
    priority_queue<pair<ll, ll>, vector<pair<ll, ll>>, greater<pair<ll, ll>>> cheapest, best_diff;
    for (int i = 0; i < p.size(); ++i) cheapest.push({p[i], i});

    for (int i = 0; i < K; ++i) {
        while (!cheapest.empty() && cheapest.top().first <= D) {
            ll const index = cheapest.top().second;
            best_diff.push({r[index] - p[index], index});
            cheapest.pop();
        }

        if (!best_diff.empty() && best_diff.top().first > 0) {
            D += best_diff.top().first;
            best_diff.pop();
        }

        out.push_back(D);
    }

    return out;
}

bool ok(int n, opipe& out, ipipe& in) {
    ll s = n * n * 1000 + 1;
    ll e = (n + 1) * (n + 1) * 1000;
    ll D = randl(0, (ll) 1e6);
    ll G = randl(min(s, (ll) (4e4)), min(e, (ll) 5e4));
    ll K = randl(min(s, (ll) (4e4)), min(e, (ll) 5e4));
    vl p = randvl(G, 1, 1e6);
    vl r = randvl(G, 1, 1e6);

    out << D << ' ' << G << ' ' << K << '\n';
    for (ll x: p) out << x << ' ';
    out << '\n';
    for (ll x: r) out << x << ' ';
    out << '\n';
    out.flush();

    vl ans = solve(D, K, p, r);
    for (int i = 0; i < K; ++i) {
        ll tmp;
        in >> tmp;
        if (tmp != ans[i]) return false;
    }

    return true;
}