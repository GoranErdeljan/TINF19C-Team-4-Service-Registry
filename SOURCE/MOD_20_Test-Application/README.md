# MOD 20 Test Application
This Module consists of a Application, which can be used to test the Interface between the Oi4-Service-Registry and the DNS-SD mechanism.
To install dependencies for this module, you will need to go to each submodule and run 'npm install'. The you can return to this directory and run 'node main.js'.

## Docker
If you don't want to run the app natively, you can build a docker container using 'docker build -t oi4-dns-sd-test .' in this directory. Then you can run the container using 'sudo docker run --name "dns_sd_test" --rm --net=host oi4-dns-sd-test'
You will then be able to access the web-interface.