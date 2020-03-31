# Deploying mxGraph using Vagrant

1. Install [Vagrant](https://www.vagrantup.com/downloads.html) and [VirtualBox](https://www.virtualbox.org/wiki/Downloads). On Mac you can `brew cask install vagrant`
1. Open a shell terminal and change directory to the `vagrant` directory
1. In folder `ssh_key` under `vagrant`, add your github SSH private key in a file name `id_rsa`. If that key is protected with a passphrase, you will need to execute `ssh-add /opt/system/ssh_key/id_rsa` manually before deploying. Refer to [github documentation](https://help.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) for more details.
1. Also, add your github username and email for files `GIT_USERNAME` and `GIT_EMAIL` (create those in the template directory), eg. `echo "alderg@gmail.com" > /opt/system/template/GIT_EMAIL` and `echo "alderg" > /opt/system/template/GIT_USERNAME`
1. Copy `settings.xml.template` file to `settings.xml`. In the copied file (`settings.xml`), replace `USERNAME` with your GitHub username, and `TOKEN` with your personal access token (must have `repo`, `write:packages`, `read:packages`, and `delete:packages` scopes) [more info](https://help.github.com/en/github/managing-packages-with-github-package-registry/configuring-apache-maven-for-use-with-github-package-registry).
1. Run `vagrant up`. It will take longer the first time only.
1. Now, run `vagrant ssh` to login to the VM
1. In the VM shell, run `npm adduser` in order to be able to deploy to npmjs.com. This is needed only once. It will be remembered.
1. We can now start the building process. Run `rm -rf mxgraph2; git clone https://github.com/jgraph/mxgraph2.git; cd mxgraph2; git checkout mxgraph-4_0_4; chmod 777 build.sh; ./build.sh`. Note, change `checkout mxgraph-4_0_4` to match the version you want to build.
1. Now, deploy using `build/deploy.sh`

Note: You can shutdown the VM using `vagrant halt`

# Using the same VM to deploy again

1. Start Vagrant VM `vagrant up`
1. Login to the VM using `vagrant ssh`
1. Only last two steps are needed (`rm -rf mxgraph2; git clone https://github.com/jgraph/mxgraph2.git; cd mxgraph2; git checkout mxgraph-4_0_4; chmod 777 build.sh; ./build.sh` followed by `build/deploy.sh`) in addition to `ssh-add /opt/system/ssh_key/id_rsa` in the beginning if the SSH key is protected by a passphrase.
1. Then type `exit` and `vagrant halt`
