#include "libgrade.h"

int num(void) {
    return 10;
}

l solve(l G, l D, l N, const vl &x, const vl &c) {
   vl next(N + 1, -1);

   l min = INF;
   l ind = -1;
   for (int i = 0; i < N; i++) {
       if (c[i] < min) {
           min = c[i];
           next[ind + 1] = i;
           ind = i;
       }
   }
   next[ind + 1] = N;

   l j = -1;
   l cost = 0;
   while (j != N) {
       l x_pos = j == -1 ? 0 : x[j];
       l n = next[j + 1];
       l nx_pos = n == N ? D : x[n];
       l dist = nx_pos - x_pos;
       if (j == -1 && dist > G) return -1;
       cost += max(0ll, (dist - G) * (j == -1 ? 0 : c[j]));
       G = max(G, dist) - dist;


       j = n;
   }

   return cost;
}

bool ok(int n, opipe& mout, ipipe& min) {
    l G, D, N;

    N = randl(1, 2500);
    D = randl(1, 1e9);

    sl xs = randsl(N, 1, D);
    vl x = sltovl(xs);

    if (n == 6) G = x.back() + 5;
    else if (n == 7) G = 0;
    else if (n == 8) G = x[0] - 1;
    else if (n == 9) G = x[0];
    else G = randl(0, D);

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

    mout << G << " " << D << " " << N << endl;
    for (int i = 0; i < N; ++i) {
        mout << x[i] << " " << c[i] << endl;
    }

    l ans, correct;
    min >> ans;
    correct = solve(G, D, N, x, c);

    return ans == correct;
}