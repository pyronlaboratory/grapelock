use super::transfer_tokens;
use crate::{Offer, OfferStatus, ANCHOR_DISCRIMINATOR};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

// See https://www.anchor-lang.com/docs/account-constraints#instruction-attribute
#[derive(Accounts)]
#[instruction(id: u64)]
pub struct OpenEscrowContract<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    // #[account(
    //     mut,
    //     seeds = [b"maker", id.to_le_bytes().as_ref()],
    //     bump
    // )]
    // /// CHECK: PDA used for signing, not initialized
    // pub maker: UncheckedAccount<'info>,
    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,
    #[account(mint::token_program = token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_token_account_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = maker,
        space = ANCHOR_DISCRIMINATOR + Offer::INIT_SPACE,
        seeds = [b"offer", maker.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,
    #[account(
        init,
        payer = maker,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    // #[account(mut)]
    // pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

// Move the tokens from the maker's ATA to the vault
pub fn send_offered_tokens_to_vault(
    context: &Context<OpenEscrowContract>,
    token_a_offered_amount: u64,
    // maker_bump: u8,
) -> Result<()> {
    // let offer_id_bytes = context.accounts.offer.id.to_le_bytes();
    // let maker_seeds = &[b"maker", offer_id_bytes.as_ref(), &[maker_bump]];
    // let signer_seeds = &[&maker_seeds[..]];

    transfer_tokens(
        &context.accounts.maker_token_account_a,
        &context.accounts.vault,
        &token_a_offered_amount,
        &context.accounts.token_mint_a,
        &context.accounts.maker,
        &context.accounts.token_program,
        // signer_seeds,
    )
}

// Save the details of the offer to the offer account
pub fn save_offer(
    context: Context<OpenEscrowContract>,
    id: u64,
    token_b_wanted_amount: u64,
) -> Result<()> {
    context.accounts.offer.set_inner(Offer {
        id,
        maker: context.accounts.maker.key(),
        taker: None,
        token_mint_a: context.accounts.token_mint_a.key(),
        token_mint_b: context.accounts.token_mint_b.key(),
        token_b_wanted_amount,
        bump: context.bumps.offer,
        status: OfferStatus::Created,
    });
    Ok(())
}
