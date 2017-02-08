FROM mysql:5.7

# ENV MYSQL_ROOT_PASSWORD 123456
ENV MYSQL_ALLOW_EMPTY_PASSWORD yes
COPY ./test/setup.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
