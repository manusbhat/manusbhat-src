server {
	server_name api.esoteric.manubhat.com localhost;
	add_header Access-Control-Allow-Origin https://esoteric.manubhat.com always;
	add_header Access-Control-Allow-Headers "Authorization, Origin, X-Requested-With, Content-Type, Accept" always;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, DELETE, PUT' always;

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

	location /sync {
		proxy_pass http://localhost:3194;
	}

	location /text {
		proxy_pass http://localhost:3195;
	}
}
