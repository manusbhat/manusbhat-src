#include "libgrade.h"

int init(void) {
    return 12;
}

vl solve(ll n, vl& s, vl& f, vl& t) {
    vl out;
    out.push_back(f[0] * t[0]);
    ll tp = t[0];

    for (int i = 1; i < n; ++i) {
        ll naive = f[i] * t[i];
        ll time = t[i];
        ll subnaive = s[i] * t[i];

        if (subnaive < out.back()) {
            time = tp;
            naive = out.back() + (f[i] - s[i]) * time;
        }

        out.push_back(naive);
        tp = time;
    }

    return out;
}

bool ok(int num, opipe& out, ipipe& in) {
    ll s = num * num * 1000 + 1;
    ll e = (num + 1) * (num + 1) * 1000;
    ll n = randl(min(s, (ll) (4e4)), min(e, (ll) 5e4));

    vl intervals = sltovl(randsl(2 * n, 1, 1e9));
    vl start;
    vl end;
    vl t = randvl(n, 1, 1e4);
    for (int i = 0; i < 2 * n; ++i) (i & 1 ? end : start).push_back(intervals[i]);

    out << n << '\n';
    for (int i = 0; i < n; ++i) out << start[i] << ' ' << end[i] << ' ' << t[i] << '\n';
    out.flush();

    vl ans = solve(n, start, end, t);
    for (int i = 0; i < n; ++i) {
        ll comp;
        in >> comp;
        cerr << comp << " " << ans[i] << endl;
        if (comp != ans[i]) {
            return false;
        }
    }

    return true;
}