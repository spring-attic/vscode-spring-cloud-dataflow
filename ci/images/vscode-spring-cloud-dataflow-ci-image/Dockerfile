FROM ubuntu:18.04

ADD npmrc /root/.npmrc

RUN apt-get update && apt-get install -y \
  build-essential \
  gettext-base \
  git \
  jq \
  curl \
  xvfb \
  icewm

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
  && apt-get install -y nodejs

CMD /bin/bash
