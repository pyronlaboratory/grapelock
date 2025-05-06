#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;

use instructions::factory::*;
use instructions::shared::MetadataArgs;

declare_id!("GHMkgYRXD5zosBjEePwZ3fdxTwdMF5XhCZhFqVQcM9sQ");
#[program]
pub mod grpx_dprotocols {
    use super::*;

    // === Factory Instructions ===
    pub fn create(ctx: Context<CreateCollectionNFT>, metadata_args: MetadataArgs) -> Result<()> {
        ctx.accounts.create(&ctx.bumps, metadata_args)
    }

    pub fn mint(ctx: Context<MintCollectionNFT>, metadata_args: MetadataArgs) -> Result<()> {
        ctx.accounts.mint(&ctx.bumps, metadata_args)
    }

    pub fn verify(ctx: Context<VerifyCollectionNFT>) -> Result<()> {
        ctx.accounts.verify(&ctx.bumps)
    }
}
