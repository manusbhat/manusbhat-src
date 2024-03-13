#include "libgrade.h"

int init(void) {
    return 12;
}

ll parent[100000];
ll child[100000];
ll meta[100000];
ll sister[100000];
ll visited[100000];

void dfs(int n, int p, adjl& tree) {
    if (p == -1) child[n] = tree[n].size();
    else child[n] = tree[n].size() - 1;
    parent[n] = p;

    for (ll chd: tree[n]) {
        if (chd != p) {
            dfs(chd, n, tree);
        }
    }
}

ll dfs2(int m, int p, adjl& tree) {
    if (visited[m]) return 0;
    visited[m] = 1;
    // four edges
    for (ll next: tree[m]) {
        if (next != p) {
            return dfs2(next, m, tree);
        }
    }

    return 0;
}

ll solve(adjl& tree, vector<pair<ll, ll>>& sisters) {
    memset(child, 0, sizeof child);
    memset(parent, 0, sizeof parent);
    memset(meta, -1, sizeof meta);
    memset(sister, 0, sizeof sister);
    memset(visited, 0, sizeof visited);

    int N = tree.size();

    for (int i = 0; i < N / 2; ++i) {
        sister[sisters[i].first] = sisters[i].second;
        sister[sisters[i].second] = sisters[i].first;
    }

    // partition tree using topo
    dfs(0, -1, tree);

    queue<int> leaves;
    vector<pair<int, int>> metas;
    for (int i = 0; i < N; ++i) {
        if (child[i] == 0) {
            leaves.push(i);
        }
    }

    while (leaves.size() > 0) {
        int curr = leaves.front();
        leaves.pop();

        ll p = parent[curr];
        if (p == -1 || meta[p] >= 0) {
            return -1;
        }
        else {
            meta[curr] = metas.size();
            meta[p] = metas.size();
            metas.emplace_back(curr, p);

            if (parent[p] != -1) {
                if (!--child[parent[p]]) {
                    leaves.push(parent[p]);
                }
            }
        }
    }

    // draw an edge between meta nodes
    adjl sub_adj(N / 2);

    for (int i = 0; i < N / 2; ++i) {
        int pair_a = meta[sister[metas[i].first]];
        int pair_b = meta[sister[metas[i].second]];
        sub_adj[i].push_back(pair_a);
        sub_adj[pair_a].push_back(i);
        sub_adj[i].push_back(pair_b);
        sub_adj[pair_b].push_back(i);
    }

    // solve permutation graph
    ll ans = 0;
    for (int i = 0; i < N / 2; ++i) {
        if (!visited[i]) {
            ans += dfs2(i, -1, sub_adj) - 1;
        }
    }

    return ans;
}

bool ok(int n, opipe& out, ipipe& in) {
    ll s = min((ll) n * n * 1000ll, (ll) 9e-4);
    ll e = min((n + 1) * (n + 1) * 1000ll, (ll) 1e5);
    ll N = randl(s, e) / 2 * 2;

    adjl adj(N);
    if (n < 6) {
        // random tree (tends to be non solvable)
        adj = randtree(N);
    }
    else {
        // random solvable
        adj_edge(adj, 0, 1);
        for (int i = 1; i < N / 2; ++i) {
            adj_edge(adj, 2 * i, 2 * i + 1);
            adj_edge(adj, 2 * i, randl(0, 2 * i));
        }
    }

    // pairs are just random... should improve in future
    vector<pair<ll, ll>> sisters;

    vl perm = randpl(N);
    for (int i = 0; i < N / 2; ++i) sisters.emplace_back(perm[2 * i] - 1, perm[2 * i + 1] - 1);

    out << N << '\n';
    print_adjl(adj, out);
    for (const auto& sister: sisters) {
        out << sister.first + 1 << ' ' << sister.second + 1 << '\n';
    }
    out.flush();

    ll y_true = solve(adj, sisters);
    ll y_pred;
    in >> y_pred;

    return y_true == y_pred;
}