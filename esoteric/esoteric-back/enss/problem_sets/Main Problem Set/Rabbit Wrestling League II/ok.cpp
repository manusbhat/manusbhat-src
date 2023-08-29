#include "libgrade.h"

int init(void) {
    return 12;
}

ll dp[100000][20];
ll leaf[100000];
ll mod = 1e9 + 7;

ll solve(int N, vector<pair<ll, ll>>& winners) {
    memset(dp, 0, sizeof dp);
    for (int i = 0; i < N; ++i) dp[i][0] = 1;

    int log = 31 - __builtin_clz(N);
    for (int k = 0; k < log; ++k) {
        memset(leaf, 0, sizeof leaf);
        for (int n = 0; n < N; ++n) leaf[n >> k] = (leaf[n >> k] + dp[n][k]) % mod;

        for (int n = 0; n < N; ++n) {
            int bucket = n >> k;
            int opponent = bucket ^ 1;
            dp[n][k + 1] = (dp[n][k] * leaf[opponent]) % mod;
        }

        for (const auto& winner: winners) {
            ll bucketA = winner.first >> k;
            ll bucketB = winner.second >> k;
            if ((bucketA ^ bucketB) == 1) {
                ll const delta = dp[winner.first][k] * dp[winner.second][k] % mod;
                dp[winner.second][k + 1] = ((dp[winner.second][k + 1] - delta) % mod + mod) % mod;
            }
        }
    }

    ll sum = 0;
    for (int i = 0; i < N; ++i) sum = (sum + dp[i][log]) % mod;

    return sum;
}

bool ok(int n, opipe& out, ipipe& in) {
    ll exp = min(n + 10ll, 16ll);
    ll N = 1 << exp;

    set<pair<ll, ll>> winners;

    if (n == 6) {
        // zero ways to win
        for (int i = 0; i < N; ++i) {
            winners.emplace(i, i ^ 1);
        }
    }
    else if (n == 7) {
        // omega cycle
        for (int i = 0; i < N; ++i) {
            winners.emplace(i, (i + 1) % N);
        }
    }
    else if (n == 8) {
        // 1 wins against everyone else
        for (int i = 1; i < N; ++i) winners.emplace(0, i);
    }
    else if (n == 9) {
        // everyone wins against 1
        for (int i = 1; i < N; ++i) winners.emplace(i, 0);
    }
    else if (n == 10) {
        // almost a full cycle
        for (int i = 0; i < N; ++i) {
            winners.emplace(i, (i + 1) % N);
        }
    }
    else {
        ll p_naive = randl(5e4, 1e5);
        vl w = randvl(p_naive, 0, N);
        vl l = randvl(p_naive, 0, N);
        for (int i = 0; i < p_naive; ++i) if (w[i] != l[i] && winners.find({l[i], w[i]}) == winners.end()) {
            winners.emplace(w[i], l[i]);
        }
    }

    vector<pair<ll, ll>> winners_v(all(winners));
    ll P = winners_v.size();

    out << N << ' ' << P << '\n';
    for (int i = 0; i < P; ++i) out << winners_v[i].first + 1 << ' ' << winners_v[i].second + 1 << '\n';
    out.flush();

    ll ans = solve(N, winners_v);
    ll pred;
    in >> pred;

    return ans == pred;
}