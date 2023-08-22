#include "libgrade.h"

int init(void) {
    return 12;
}

ll solve(ll K, ll G, ll D, ll N, const vl &x, const vl &c) {
   vl next(N + 1, -1);

   stack<ll> stk;
   next[0] = 1;

   for (ll i = 0; i < N; ++i) {
        while (!stk.empty() && c[stk.top()] > c[i]) {
            next[stk.top() + 1] = i;
            stk.pop();
        }
        stk.push(i);
   }
   while (!stk.empty()) {
       next[stk.top() + 1] = N;
       stk.pop();
   }

   ll cost = 0;
   for (ll i = -1; i < N; ++i) {
        ll curr_x = i == -1 ? 0 : x[i];
        ll next_x = i == N - 1 ? D : x[i + 1];
        ll targ_x = next[i + 1] == N ? D : x[next[i + 1]];
        ll price = i == -1 ? 0 : c[i];

        ll target = targ_x - curr_x;
        if (G < target && i >= 0) {
            ll next_g = min(K, target);
            cost += (next_g - G) * price;
            G = next_g;
        }

        G -= next_x - curr_x;
        if (G < 0) {
            return -1;
        }
   }

   return cost;
}

bool ok(int n, opipe& out, ipipe& in) {
    ll K, G, D, N;

    N = randl(min(n * 10000, 90000), 100000);
    D = randl(N + 100, 1e9 - 100);

    sl xs = randsl(N, 1, D);
    vl x = sltovl(xs);

    if (n == 6) G = D + 5;
    else if (n == 7) G = 0;
    else if (n == 8) G = x[0] - 1;
    else if (n == 9) G = x[0];
    else G = randl(0, x[5] + 1);

    if (K <= 3) K = randl(G, 1e9);
    else K = randl(G, min(3 * G + 1, (ll) 1e9));

    vl c;
    if (n == 0) {
        c = vl(N, 1);
    }
    else if (n == 1) {
        c = vl(N, 1e6);
    }
    else if (n == 2) {
        c = vl(N, 1);
        c[0] = 1e6;
    }
    else if (n == 3) {
        c = vl(N, 1);
        c.back() = 1e6;
    }
    else if (n == 4) {
        c = vl(N, 1);
        iota(all(c), 1);
    }
    else if (n == 5) {
        c = vl(N, 1);
        iota(all(c), 1);
        reverse(all(c));
    }
    else c = randvl(N, 1, 1e6);

    if (n == 10) {
        // all K - 2 away
        // c alternates
        K = 40;
        G = 30;
        N = 80000;
        x = c = {};
        for (int i = 0; i < N; ++i) {
            x.push_back((K - 2) * (i + 1));
            c.push_back(i % 2 ? 1e-6 - i : i);
        }
        D = x.back() + K;
    }
    else if (n == 11) {
        // [low at 0, high at K - 3, low at K - 1, high at 2 K - 3, low at 2K]
        K = 400;
        G = 390;
        N = 100000;
        for (int i = 1; i <= N / 4; ++i) {
            x.push_back(i * 2 * K);
            x.push_back(i * 2 * K + K - 3);
            x.push_back(i * 2 * K + K - 1);
            x.push_back(i * 2 * K + 2 * K - 3);
            c.push_back(4);
            c.push_back(10000);
            c.push_back(5);
            c.push_back(989);
        }

        D = x.back() + K;
    }

    out << K << " " << G << " " << D << " " << N << '\n';
    for (int i = 0; i < N; ++i) {
        out << x[i] << " " << c[i] << '\n';
    }
    out.flush();

    ll ans, correct;
    in >> ans;
    correct = solve(K, G, D, N, x, c);

    return ans == correct;
}