FROM nginx
COPY ./public /tmp/dist
COPY ./nginx.conf /tmp/
RUN cp -r /tmp/dist/* /usr/share/nginx/html/ \
    && rm -f /etc/nginx/nginx.conf \
    && cp /tmp/nginx.conf /etc/nginx/
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
