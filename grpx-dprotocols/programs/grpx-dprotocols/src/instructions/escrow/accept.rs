use crate::{error::GrpxProtocolError, Offer, OfferStatus};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};
#[derive(Accounts)]
pub struct AcceptOffer<'info> {
    #[account(mut)]
    pub producer: SystemAccount<'info>,

    #[account(mut)]
    pub consumer: Signer<'info>,

    pub token_mint_a: InterfaceAccount<'info, Mint>,

    pub token_mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = consumer,
        associated_token::token_program = token_program,
    )]
    pub consumer_token_account_b: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        has_one = producer,
        has_one = token_mint_a,
        has_one = token_mint_b,
        constraint = offer.status == OfferStatus::Created @ GrpxProtocolError::InvalidOfferStatus,
        seeds = [b"offer", producer.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    offer: Account<'info, Offer>,

    #[account(
        init_if_needed,
        payer = consumer,
        associated_token::mint = token_mint_b,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault_token_account_b: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> AcceptOffer<'info> {
    pub fn deposit_sol_to_vault(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let transfer_accounts = TransferChecked {
            from: self.consumer_token_account_b.to_account_info(),
            mint: self.token_mint_b.to_account_info(),
            to: self.vault_token_account_b.to_account_info(),
            authority: self.consumer.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, transfer_accounts);
        transfer_checked(
            cpi_ctx,
            self.offer.token_b_desired_amount,
            self.token_mint_b.decimals,
        )?;

        self.offer.consumer = Some(self.consumer.key());
        self.offer.status = OfferStatus::Accepted;
        Ok(())
    }
}
