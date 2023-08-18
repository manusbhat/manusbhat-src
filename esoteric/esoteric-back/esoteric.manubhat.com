limit_req_zone $binary_remote_addr zone=weblimit:20m rate=50r/s;

server {
	server_name esoteric.manubhat.com;

	limit_req zone=weblimit burst=12;


	location / {
		root /var/www/esoteric/static;
		index index.html;

		# try querying the path directly, otherwise
		try_files $uri $uri/ /index.html =404;
	}
}

