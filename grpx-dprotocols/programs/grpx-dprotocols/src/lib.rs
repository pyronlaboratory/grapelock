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
    pub fn create(ctx: Context<CreateCollectionNFT>, metadata_args: MetadataArgs) -> Result<()> {
        ctx.accounts.create(&ctx.bumps, metadata_args)
    }

    pub fn mint(ctx: Context<MintCollectionNFT>, metadata_args: MetadataArgs) -> Result<()> {
        ctx.accounts.mint(&ctx.bumps, metadata_args)
    }

    pub fn verify(ctx: Context<VerifyCollectionNFT>) -> Result<()> {
        ctx.accounts.verify(&ctx.bumps)
    }

    // === Escrow Instructions ===
    pub fn open(
        ctx: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_desired_amount: u64,
    ) -> Result<()> {
        ctx.accounts
            .open_contract(id, token_b_desired_amount, &ctx.bumps)?;
        ctx.accounts.deposit_to_vault(token_a_offered_amount)?;

        Ok(())
    }

    // pub fn accept(ctx: Context<AcceptOffer>) -> Result<()> {
    //     instructions::accept::send_wanted_tokens_to_vault(&ctx)?;
    //     instructions::accept::transfer_nft_to_taker(ctx)
    // }

    pub fn confirm(ctx: Context<ConfirmDelivery>) -> Result<()> {
        instructions::confirm::validate_offer_state_confirm(&ctx)?;
        instructions::confirm::send_payment_to_maker(&ctx)?;
        instructions::confirm::complete_and_close_vault(ctx)
    }

    pub fn refund(ctx: Context<RefundRequest>) -> Result<()> {
        instructions::refund::validate_offer_state_refund(&ctx)?;
        instructions::refund::return_payment_to_taker(&ctx)?;
        instructions::refund::return_nft_to_maker(&ctx)?;
        instructions::refund::refund_and_close_vault(ctx)
    }
}

// Finish tests
// Integrate with backend
