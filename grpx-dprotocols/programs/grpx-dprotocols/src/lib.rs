#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
pub mod constants;
pub mod error;
pub mod instructions;

use instructions::factory::*;
declare_id!("EY6rxjcbHnRPBJp7qerSbjvfvCU4yPnp2UsECiKPrALd");

#[program]
pub mod grpx_dprotocols {
    use super::*;

    // === Factory Instructions ===
    pub fn create_collection(
        ctx: Context<CreateCollection>,
        metadata_args: MetadataArgs,
    ) -> Result<()> {
        ctx.accounts.create_collection(&ctx.bumps, metadata_args)
    }

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        ctx.accounts.mint_nft(&ctx.bumps)
    }

    pub fn verify_collection(ctx: Context<VerifyCollectionMint>) -> Result<()> {
        ctx.accounts.verify_collection(&ctx.bumps)
    }
}
