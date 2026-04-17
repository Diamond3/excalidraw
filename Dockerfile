FROM --platform=${BUILDPLATFORM} node:20 AS build

WORKDIR /opt/node_app

COPY . .

# do not ignore optional dependencies:
# Error: Cannot find module @rollup/rollup-linux-x64-gnu
RUN --mount=type=cache,id=yarn-cache,target=/root/.cache/yarn \
    npm_config_target_arch=${TARGETARCH} yarn --network-timeout 600000

ARG NODE_ENV=production

RUN npm_config_target_arch=${TARGETARCH} yarn build:app:docker

FROM --platform=${TARGETPLATFORM} nginx:1.27-alpine

ENV PORT=80
ENV BACKEND_HOST=backend:3002
ENV NGINX_ENVSUBST_FILTER=^(PORT|BACKEND_HOST)$

COPY --from=build /opt/node_app/excalidraw-app/build /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

HEALTHCHECK CMD wget -q -O /dev/null http://localhost:${PORT} || exit 1
