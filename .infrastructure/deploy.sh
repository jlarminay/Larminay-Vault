#!/bin/bash
set -e

### Terraform
printf '\n------------------------\n -Starting Terraform-\n\n'
cd terraform
terraform init \
	-backend-config="access_key=$DO_SPACES_ACCESS" \
	-backend-config="secret_key=$DO_SPACES_SECRET"
terraform workspace select -or-create $ENVIRONMENT

envsubst < terraform.tfvars.template > terraform.tfvars
terraform apply --auto-approve

export DROPLET_IP=$(terraform output -raw droplet_ip)
export VOLUME_NAME=$(terraform output -raw volume_name)

### Replace env
printf '\n------------------------\n -Replace Env-\n\n'
cd ../remote
export LAST_DEPLOY=$(date +%Y-%m-%d_%H-%M-%S)
envsubst < .env.template > .env
envsubst < Caddyfile.template > Caddyfile

### Ansible
printf '\n------------------------\n -Starting Ansible-\n\n'
cd ../ansible

export ANSIBLE_CONFIG=./ansible.cfg
envsubst < hosts.ini.template > hosts.ini
ansible-playbook ./playbook.yml
