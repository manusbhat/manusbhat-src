#include "libgrade.h"

int init(void) {
    return 9;
}

int degree[50000];
int visited[50000];

void dfs(int n, adjl& adj) {
    if (visited[n]) return;
    visited[n] = 1;
    for (ll i: adj[n]) {
        dfs(i, adj);
    }
}

bool solve(ll N, ll M, adjl& adj) {
    memset(visited, 0, sizeof visited);
    memset(degree, 0, sizeof visited);

    dfs(0, adj);
    int numTwo = 0;
    int numFour = 0;
    int numVisited = 0;
    for (int i = 0; i < N; ++i) {
        if (adj[i].size() == 2) numTwo++;
        if (adj[i].size() == 4) numFour++;
        if (visited[i]) numVisited++;
    }

    return numFour == 1 && numTwo == adj.size() - 1 && numVisited == adj.size();
}

bool ok(int n, opipe& out, ipipe& in) {
    ll N, M;
    adjl adj;

    if (n == 0) {
        // sample
        N = 5;
        adj = adjl(N);
        M = 6;
        adj_edge(adj, 0, 1);
        adj_edge(adj, 0, 2);
        adj_edge(adj, 0, 3);
        adj_edge(adj, 0, 4);
        adj_edge(adj, 1, 2);
        adj_edge(adj, 3, 4);
    }
    else if (n == 1) {
        // unbalanced
        N = 41000;
        adj = adjl(N);
        M = 0;
        for (int i = 0; i < 40000; ++i) {
            adj_edge(adj, i, (i + 1) % 40000);
            M++;
        }

        for (int i = 39999; i < 41000; ++i) {
            adj_edge(adj, i == 39999 ? 0 : i, (i + 1) % 41000);
            M++;
        }
    }
    else if (n == 2 || n == 3) {
        // large and balanced
        N = n == 2 ? 40000 : 40001;
        adj = adjl(N);
        M = 0;
        for (int i = 0; i < 20000; ++i) {
            adj_edge(adj, i, (i + 1) % 20000);
            M++;
        }

        for (int i = 19999; i < 40000; ++i) {
            adj_edge(adj, i == 19999 ? 0 : i, (i + 1) % 40000);
            M++;
        }
        if (n == 3) {
            // add extra component
            adj_edge(adj, 0, 40000);
            M++;
        }
    }
    else if (n == 4) {
        // sample 2
        N = 6;
        adj = adjl(N);
        M = 7;
        adj_edge(adj, 0, 1);
        adj_edge(adj, 0, 2);
        adj_edge(adj, 0, 3);
        adj_edge(adj, 0, 4);
        adj_edge(adj, 1, 2);
        adj_edge(adj, 3, 4);
        adj_edge(adj, 4, 5);
    }
    else if (n == 5) {
        // junction
        N = 6;
        adj = adjl(N);
        M = 7;
        adj_edge(adj, 0, 1);
        adj_edge(adj, 0, 2);
        adj_edge(adj, 1, 2);
        adj_edge(adj, 0, 3);
        adj_edge(adj, 3, 4);
        adj_edge(adj, 3, 5);
        adj_edge(adj, 4, 5);
    }
    else if (n == 6) {
        // two junctions
        N = 4;
        adj = adjl(N);
        M = 5;
        adj_edge(adj, 0, 1);
        adj_edge(adj, 0, 2);
        adj_edge(adj, 1, 2);
        adj_edge(adj, 2, 3);
        adj_edge(adj, 3, 0);
    }
    else if (n == 7) {
        // crossover
        N = 6;
        adj = adjl(N);
        M = 8;
        adj_edge(adj, 0, 1);
        adj_edge(adj, 1, 2);
        adj_edge(adj, 2, 3);
        adj_edge(adj, 3, 4);
        adj_edge(adj, 4, 5);
        adj_edge(adj, 5, 0);
        adj_edge(adj, 0, 3);
        adj_edge(adj, 1, 3);
    }
    else if (n == 8) {
        // sample
        N = 8;
        adj = adjl(N);
        M = 9;
        adj_edge(adj, 0, 1);
        adj_edge(adj, 0, 2);
        adj_edge(adj, 0, 3);
        adj_edge(adj, 0, 4);
        adj_edge(adj, 1, 2);
        adj_edge(adj, 3, 4);
        adj_edge(adj, 5, 6);
        adj_edge(adj, 6, 7);
        adj_edge(adj, 7, 5);
    }

    out << N << ' ' << M << '\n';
    print_adjl(adj, out);
    out.flush();

    bool comp = solve(N, M, adj);
    string ans;
    in >> ans;

    return (ans == string("YES")) == comp;
}