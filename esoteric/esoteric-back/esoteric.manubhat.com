server {
	server_name esoteric.manubhat.com;

	location / {
		root /var/www/esoteric/static;
		index index.html;

		try_files $uri $uri/ =404;
	}
}

