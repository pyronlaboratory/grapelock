use crate::constants::ANCHOR_DISCRIMINATOR;
use crate::state::{Offer, OfferStatus};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateOffer<'info> {
    #[account(mut)]
    pub producer: Signer<'info>,

    #[account(mint::token_program = token_program)]
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    #[account(mint::token_program = token_program)]
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = producer,
        associated_token::token_program = token_program
    )]
    pub producer_token_account_a: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = producer,
        space = ANCHOR_DISCRIMINATOR + Offer::INIT_SPACE,
        seeds = [b"offer", producer.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,

    #[account(
        init,
        payer = producer,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault_token_account_a: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateOffer<'info> {
    pub fn open_vault(
        &mut self,
        id: u64,
        token_b_desired_amount: u64,
        bumps: &CreateOfferBumps,
    ) -> Result<()> {
        self.offer.set_inner(Offer {
            id,
            producer: self.producer.key(),
            consumer: None,
            token_mint_a: self.token_mint_a.key(),
            token_mint_b: self.token_mint_b.key(),
            token_a_offered_amount: 1,
            token_b_desired_amount,
            status: OfferStatus::Created,
            bump: bumps.offer,
        });

        Ok(())
    }

    pub fn deposit_nft_to_vault(&mut self, token_a_offered_amount: u64) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let transfer_accounts = TransferChecked {
            from: self.producer_token_account_a.to_account_info(),
            mint: self.token_mint_a.to_account_info(),
            to: self.vault_token_account_a.to_account_info(),
            authority: self.producer.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, transfer_accounts);
        transfer_checked(cpi_ctx, token_a_offered_amount, self.token_mint_a.decimals)
    }
}
