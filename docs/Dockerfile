FROM jekyll/jekyll:4.0

WORKDIR /dependencies 
COPY ./Gemfile /dependencies
RUN chmod a+rwx /dependencies && bundle install
WORKDIR /srv/jekyll
