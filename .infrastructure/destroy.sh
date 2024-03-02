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
terraform destroy --auto-approve