#include "libgrade.h"

int init(void) {
    return 10;
}

bool ok(int num, opipe& out, ipipe& in) {
    ll n = randl(250, 750);
    ll m = randl(250, 750);
    ll K;
    vector<vl> mat(n);
    for (int i = 0; i < n; ++i) mat[i] = randvl(m, 1, 1 + n * m);

    // inlined to reuse the sum
    vl deltas(mat.size() * mat[0].size() + 1);
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            if (i > 0 && mat[i - 1][j] < mat[i][j]) deltas[mat[i][j]] += mat[i][j] - mat[i - 1][j];
            if (j > 0 && mat[i][j - 1] < mat[i][j]) deltas[mat[i][j]] += mat[i][j] - mat[i][j - 1];

            if (i + 1 < n && mat[i + 1][j] < mat[i][j]) deltas[mat[i][j]] += mat[i][j] - mat[i + 1][j];
            if (j + 1 < m && mat[i][j + 1] < mat[i][j]) deltas[mat[i][j]] += mat[i][j] - mat[i][j + 1];
        }
    }

    ll sum = accumulate(all(deltas), 0ll);

    if (n == 4) K = 0;
    else K = randl(0, sum);

    int ptr = n * m;
    while (sum > K) sum -= deltas[ptr--];

    out << n << ' ' << m << ' ' << K << '\n';
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < m; ++j) {
            out << mat[i][j] << ' ';
        }
        out << '\n';
    }
    out.flush();

    ll ans = ptr + 1;
    ll comp;
    in >> comp;

    return ans == comp;
}