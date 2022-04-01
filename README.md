this is using the boilerplate for deploying to heroku and added our own code.
<br>
For Puppeteer to be able to run inside heroku, need to input the build pack manually
<br>
heroku buildpacks:clear
<br>
heroku buildpacks:add --index 1 https://github.com/jontewks/puppeteer-heroku-buildpack
<br>
heroku buildpacks:add --index 1 heroku/nodejs
<br>

there are more things that maybe can be better, but this is nice.