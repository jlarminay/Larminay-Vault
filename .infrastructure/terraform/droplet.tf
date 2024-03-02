# Wait for the Volume to mount to the Droplet to ensure "Resource Busy" error is not encountered
resource "time_sleep" "wait_20_seconds" {
  depends_on = [digitalocean_droplet.this]

  create_duration = "30s"
}

# Create a new droplet
resource "digitalocean_droplet" "this" {
  name        = "${local.common_name}-droplet"
  region      = "tor1"
  size        = "s-2vcpu-2gb" // https://slugs.do-api.dev/
  image       = "ubuntu-22-04-x64"
  monitoring  = true
  resize_disk = false
  backups     = var.environment == "production" ? true : false
  
  ssh_keys = [
    # Keys go here
  ]
}
