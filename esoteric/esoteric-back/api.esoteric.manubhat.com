limit_req_zone $binary_remote_addr zone=apilimit:20m rate=50r/s;

server {
	server_name api.esoteric.manubhat.com localhost;
	add_header Access-Control-Allow-Origin https://esoteric.manubhat.com always;
	add_header Access-Control-Allow-Headers "Authorization, Origin, X-Requested-With, Content-Type, Accept" always;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, DELETE, PUT' always;

    limit_req zone=apilimit burst=12;

    # all OPTIONS requests are auto passed because of CORS
    if ($request_method = OPTIONS ) {
        return 200;
    }

	location /status {
		return 200;
	}

	location /auth {
		proxy_pass http://localhost:3192;
	}

	location /enss {
		proxy_pass http://localhost:3193;
	}

    location /sync/slave {
        proxy_pass http://localhost:3194;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

	location /sync {
		proxy_pass http://localhost:3194;
	}

	location /text {
		proxy_pass http://localhost:3195;
	}
}
