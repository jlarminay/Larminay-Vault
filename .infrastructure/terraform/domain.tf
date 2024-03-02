resource "cloudflare_record" "client" {
  zone_id = var.cf_zone_id
  name    = var.domain
  value   = digitalocean_droplet.this.ipv4_address
  type    = "A"
  ttl     = 60
}