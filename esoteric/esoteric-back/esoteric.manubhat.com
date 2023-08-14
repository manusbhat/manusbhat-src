limit_req_zone $binary_remote_addr zone=mylimit:20m rate=50r/s;

server {
	server_name esoteric.manubhat.com;

	limit_req zone=mylimit burst=12;

	location / {
		root /var/www/esoteric/static;
		index index.html;

		try_files $uri $uri/ =404;
	}
}

