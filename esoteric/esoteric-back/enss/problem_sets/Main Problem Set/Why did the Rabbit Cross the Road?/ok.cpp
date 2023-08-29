#include "libgrade.h"

int init(void) {
    return 12;
}

ll solve(vl& p) {
    int N = p.size();
    if (N & 1) return 0;

    vector<vector<pair<ll, ll>>> mean2(N);
    vector<vl> sort2(N);
    for (int i = 0; i < p.size(); ++i) {
        ll sum = (i + p[i]) % N;
        ll true_mid = abs(p[i] - i) > N / 2 ? sum : p[i] + i;
        // ensure shorter side is between 0 to N
        if (true_mid >= N) {
            mean2[sum].emplace_back((ll) (i + N / 2) % N, (p[i] + N / 2) % N);
            sort2[sum].push_back(min((ll) (i + N / 2) % N, (p[i] + N / 2) % N));
        }
        else {
            mean2[sum].emplace_back((ll) i, p[i]);
            sort2[sum].push_back(min((ll) i, p[i]));
        }
    }

    for (int i = 0; i < N; ++i) sort(all(sort2[i]));

    ll ans = 0;
    for (int i = 0; i < N / 2; ++i) {
        int partner = i + N / 2;
        for (int j = 0; j < mean2[i].size(); ++j) {
            ll start = mean2[i][j].first;
            ll end = mean2[i][j].second;
            if (start > end) swap(start, end);
            // fully contained in first quarter
            if (end < N / 2) {
                ans += upper_bound(all(sort2[partner]), end) - lower_bound(all(sort2[partner]), start);
            }
            else {
                ans += upper_bound(all(sort2[partner]), start) - sort2[partner].begin();
            }
        }
    }

    return ans;
}


bool ok(int n, opipe& out, ipipe& in) {
    ll N = randl((ll) 4e4, (ll) 5e4);
    if (N & 1) N--;
    else if (n == 7) N++;

    vl p;
    if (n == 8) {
        // two groups perpendicular to each other
        p = vl((size_t) N, 0ll);
        for (int i = 0; i < N; ++i) {
            if (i < N / 2) p[i] = N / 2 - 1 - i;
            else p[i] = N - 1 - i;
        }
    }
    else if (n == 9) {
        // none perpendicular
        p = vl((size_t) N, 0ll);
        for (int i = 0; i < N; ++i) p[i] = (i + randl(1, 4)) % N;
    }
    else {
        // random jumps
        p = randvl(N, 1, N);
        // ensure no identities
        for (int i = 0; i < N; ++i) p[i] = (i + p[i]) % N;
    }

    out << N << '\n';
    for (int i = 0; i < N; ++i) out << p[i] + 1 << ' ';
    out << '\n';
    out.flush();

    ll ans = solve(p), pred;
    in >> pred;

    return ans == pred;
}