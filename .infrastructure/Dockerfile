FROM ubuntu:22.04

# update
RUN apt-get update

# Install tooling
RUN apt-get install -y jq zip gzip curl nano tar git unzip wget gnupg software-properties-common gettext python3-pip iputils-ping rsync

# Install terraform
RUN wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list
RUN apt update && apt install -y terraform

# Install node
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
RUN bash -i -c 'nvm install 20.10.0'

# Install ansible
RUN pip3 install ansible

WORKDIR /home