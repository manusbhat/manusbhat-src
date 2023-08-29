#include "libgrade.h"

int init(void) {
    return 12;
}

// dp[used blocks][vowels used blocks]
ll dp[(ll) 2e4][100];
ll solve(ll K, ll C, ll V, vector<vl>& x, vector<vl>& y) {
    for (int i = 0; i < 2e4; ++i) fill(dp[i], dp[i] + 100,  -0x7f7f7f7f7f7fll);
    dp[0][0] = 0;

    // factor of k^2 can be removed by switching loop order and using psums
    // k <= 4 so it doesn't really matter
    for (int used = 0; used < C + V; ++used) {
        for (int vused = 0; vused <= V; ++vused) {
            // vertical c
            ll sum = 0;
            for (int i = 0; i < K; ++i) sum += x[i][used];
            dp[used + 1][vused] = max(dp[used + 1][vused], dp[used][vused] + sum);
            // vertical v
            sum = 0;
            for (int i = 0; i < K; ++i) sum += y[i][used];
            dp[used + 1][vused + 1] = max(dp[used + 1][vused + 1], dp[used][vused] + sum);

            // bitmask
            if (used + K <= C + V) {
                for (int mask = 1; mask < (1 << K) - 1; ++mask) {
                    sum = 0;
                    for (int j = 0; j < K; ++j) {
                        for (int k = 0; k < K; ++k) {
                            sum += ((1 << j) & mask)
                                    ? y[j][k + used]
                                    : x[j][k + used];
                        }
                    }
                    dp[used + K][vused + __builtin_popcount(mask)] = max(
                            dp[used + K][vused + __builtin_popcount(mask)],
                            dp[used][vused] + sum
                    );
                }
            }
        }
    }

    return dp[C + V][V];
}

bool ok(int n, opipe& out, ipipe& in) {
    ll s = n * n * 100 + 1;
    ll e = (n + 1) * (n + 1) * 100;
    ll C = randl(min(s, (ll) (5e3)), min(e, (ll) 1e4));
    ll V = randl(0, 51);
    ll K = randl(1, 5);

    vector<vl> x(K), y(K);
    for (int i = 0; i < K; ++i) x[i] = randvl(C + V, -1e4, 1e4 + 1);
    for (int i = 0; i < K; ++i) y[i] = randvl(C + V, -1e4, 1e4 + 1);

    out << K << ' ' << C << ' ' << V << '\n';

    for (int i = 0; i < K; ++i) {
        for (ll xp: x[i]) out << xp << ' ';
        out << '\n';
    }
    for (int i = 0; i < K; ++i) {
        for (ll yp: y[i]) out << yp << ' ';
        out << '\n';
    }
    out.flush();

    ll comp = solve(K, C, V, x, y);
    ll ans;
    in >> ans;

    return ans == comp;
}