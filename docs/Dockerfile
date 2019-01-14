FROM jekyll/jekyll:3.8

WORKDIR /dependencies 
COPY ./Gemfile /dependencies
RUN chmod a+rwx /dependencies && bundle install
WORKDIR /srv/jekyll
