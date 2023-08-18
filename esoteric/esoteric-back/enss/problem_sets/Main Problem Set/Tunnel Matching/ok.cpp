#include "libgrade.h"

int num(void) {
    return 12;
}

#define MAX_N 50000ll
#define MAX_M 50000

l depth[MAX_N + 5];
l up[MAX_N + 5][21];
l lca_count[MAX_N + 5];
l lca_prefix[MAX_N + 5];
adjl adj;

void euler(l n, l p, l d) {
    depth[n] = d;
    up[n][0] = p;
    for (l nbr: adj[n]) {
        if (nbr != p) {
            euler(nbr, n, d + 1);
        }
    }
}

void bin_jump_precomp(l n, l p, l k) {
    if (up[n][k - 1] == -1) {
        up[n][k] = -1;
    } else {
        up[n][k] = up[up[n][k - 1]][k - 1];
    }

    for (l nbr: adj[n]) {
        if (nbr != p) {
            bin_jump_precomp(nbr, n, k);
        }
    }
}

l lca(l a, l b) {
    if (depth[a] > depth[b]) a = jump(a, depth[a] - depth[b]);
    if (depth[b] > depth[a]) b = jump(b, depth[b] - depth[a]);

    if (a == b) return a;
    l d = depth[a];
    for (int j = 19; j >= 0; --j) {
        if (up[a][j] != up[b][j]) {
            a = up[a][j];
            b = up[b][j];
        }
    }

    return up[a][0];
}

void prefix_dfs(l n, l p, l running_sum) {
    lca_prefix[n] = running_sum + lca_count[n];
    for (l nbr: adj[n]) {
        if (nbr != p) {
            prefix_dfs(nbr, n, lca_prefix[n]);
        }
    }
}

l solve(const adjl& adj, const vl& s, const vl& e) {
    ::adj = adj;
    // euler tour
    euler(0, -1, 0);

    // binary jumping precomp
    for (int i = 1; i <= 20; ++i) {
        bin_jump_precomp(0, -1, i);
    }

    // lca for every single node
    for (int i = 0; i < s.size(); ++i) {
        l anc = lca(s[i], e[i]);
        lca_count[anc]++;
    }

    // prefix sum on tree for lca contents
    prefix_dfs(0, -1, 0);

    // solve every node using prefix
    l ans = 0;
    for (int i = 0; i < s.size(); ++i) {
        l anc = lca(s[i], e[i]);
        ans += lca_prefix[e[i]] + lca_prefix[s[i]] - 2 * lca_prefix[anc];
    }

    // add duplicate lca
    for (int i = 0; i < adj.size(); ++i) {
        ans += lca_count[i] * (lca_count[i] - 1) / 2;
    }

    return ans;
}

bool ok(int n, opipe& out, ipipe& in) {
    memset(lca_count, 0, sizeof lca_count);
    memset(lca_prefix, 0, sizeof lca_prefix);
    memset(up, 0, sizeof up);
    memset(depth, 0, sizeof depth);

    // random tree
    l lower = min(n * n * 1000ll, MAX_N - 1);
    l upper = max(lower + 1, min((n + 1) * (n + 1) * 1000ll, MAX_N - 1));
    l N = randl(lower, upper);
    adjl adj;
    if (n < 2) {
        adj = randtree_list(N);
    }
    else if (n < 4) {
        adj = randtree_star(N, randl(1, N));
    }
    else if (n == 5) adj = randtree_perfect(N, 5);
    else adj = randtree(N);

    l M = min(N * (N - 1) / 2, 1000ll);
    vector<l> s, e;

    // random paths (relatively straightforward)
    if (n == 5) {
        // all the same path
        s = vector(M, randl(0, N));
        e = vector(M, randl(0, N));
    }
    else if (n == 6) {
        // all disjoint
        M = min(N, M);
        s = vector(M, 0ll);
        iota(all(s), 0);
        e = s;
    }
    else if (n == 8) {
        // all on one
        s = vector(M, randl(0, N));
        e = s;
    }
    else {
        s = randvl(M, 0, N);
        e = randvl(M, 0, N);
    }

    out << N << " " << M << '\n';
    print_adjl(adj, out);
    for (l i = 0; i < M; ++i) out << s[i] + 1 << " " << e[i] + 1 << '\n';
    out.flush();

    l ans, comp = solve(adj, s, e);
    in >> ans;

    return ans == comp;
}
