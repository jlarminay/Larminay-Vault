# Configure the DigitalOcean provider
terraform {
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 2.0"
    }
  }

  backend "s3" {
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    endpoint                    = "sfo2.digitaloceanspaces.com"
    region                      = "us-west-1" // needed
    bucket                      = "larminay-vault-storage"
    key                         = "terraform.tfstate"
  }
}

provider "digitalocean" {
  token = var.do_token
}
provider "cloudflare" {
  api_key = var.cf_api_key
  email   = var.cf_email
}
