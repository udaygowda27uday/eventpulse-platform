
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

resource "aws_instance" "eventpulse" {
  ami                    = "ami-065d2b03fb493085a"
  instance_type          = "t3.micro"
  subnet_id              = "subnet-05067277e0a3020c5"
  vpc_security_group_ids = ["sg-00c70b73eaa5e045d"]
  key_name               = "Docker_Keypair"

  tags = {
    Name = "EventPulse-Backend"
  }

  lifecycle {
    prevent_destroy = true
  }
}
