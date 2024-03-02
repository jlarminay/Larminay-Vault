variable "environment" {}
variable "do_token" {}
variable "project_id" {}
variable "cf_api_key" {}
variable "cf_email" {}
variable "cf_zone_id" {}
variable "domain" {}

locals {
  common_name = "lv-${var.environment}"
}