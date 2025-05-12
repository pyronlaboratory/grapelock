#![allow(unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("FALK1GNsbCnYSfGGTvuuK6ncSQ17oGtfqTF4GiBJ5imS");
#[program]
pub mod grpx_dprotocols {
    use super::*;

    // === Factory Instructions ===
    pub fn create(ctx: Context<ForgeCollection>, metadata_args: MetadataArgs) -> Result<()> {
        ctx.accounts.create(&ctx.bumps, metadata_args)
    }

    pub fn mint(ctx: Context<MintNFT>, metadata_args: MetadataArgs) -> Result<()> {
        ctx.accounts.mint(&ctx.bumps, metadata_args)
    }

    pub fn verify(ctx: Context<AuditCollection>) -> Result<()> {
        ctx.accounts.verify(&ctx.bumps)
    }

    // === Escrow Instructions ===
    pub fn open(
        ctx: Context<CreateOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_desired_amount: u64,
    ) -> Result<()> {
        ctx.accounts
            .open_vault(id, token_b_desired_amount, &ctx.bumps)?;
        ctx.accounts.deposit_nft_to_vault(token_a_offered_amount)?;

        Ok(())
    }

    pub fn accept(ctx: Context<AcceptOffer>) -> Result<()> {
        ctx.accounts.deposit_sol_to_vault()?;

        Ok(())
    }

    pub fn confirm(ctx: Context<ConfirmOffer>) -> Result<()> {
        ctx.accounts.transfer_sol_to_producer()?;
        ctx.accounts.transfer_nft_to_consumer()?;
        ctx.accounts.close_vaults()?;

        Ok(())
    }

    pub fn refund(ctx: Context<RefundOffer>) -> Result<()> {
        ctx.accounts.process_refund()?;
        ctx.accounts.close_vaults()?;

        Ok(())
    }
}

// Finish tests
// Integrate with backend
