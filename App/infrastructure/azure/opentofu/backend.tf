# Remote state configuration for OpenTofu/Terraform
# Remote state allows teams to collaborate and prevents state file conflicts

terraform {
  # Azure Storage backend configuration
  # This stores the Terraform state file in Azure Storage instead of locally
  backend "azurerm" {
    resource_group_name  = "metaverse-social-rg"  # Resource group containing storage account
    storage_account_name = "metaversesocialstatetofu"  # Storage account name (must be globally unique)
    container_name       = "metaverse-social-rg"  # Blob container for state files
    key                  = "prod.terraform.tfstate"  # State file name within the container
    # Note: Access credentials are not stored here for security reasons
    # They can be provided via environment variables or CLI parameters
  }
}
