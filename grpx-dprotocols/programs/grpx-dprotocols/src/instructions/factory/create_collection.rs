use anchor_lang::prelude::*;
use anchor_spl::metadata::mpl_token_metadata::{
    instructions::{
        CreateMasterEditionV3Cpi, CreateMasterEditionV3CpiAccounts,
        CreateMasterEditionV3InstructionArgs, CreateMetadataAccountV3Cpi,
        CreateMetadataAccountV3CpiAccounts, CreateMetadataAccountV3InstructionArgs,
    },
    types::{CollectionDetails, Creator, DataV2},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::Metadata,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MetadataArgs {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
    pub creator_share: u8,
}
#[derive(Accounts)]
pub struct CreateCollection<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    mint: Account<'info, Mint>,
    #[account(
        seeds = [b"authority"],
        bump,
    )]
    /// CHECK: This account is not initialized and is being used for signing purposes only
    pub mint_authority: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: This account will be initialized by the metaplex program
    metadata: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: This account will be initialized by the metaplex program
    master_edition: UncheckedAccount<'info>,
    #[account(
        init,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner
    )]
    destination: Account<'info, TokenAccount>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    associated_token_program: Program<'info, AssociatedToken>,
    token_metadata_program: Program<'info, Metadata>,
}

impl<'info> CreateCollection<'info> {
    pub fn create_collection(
        &mut self,
        bumps: &CreateCollectionBumps,
        metadata_args: MetadataArgs,
    ) -> Result<()> {
        let metadata = &self.metadata.to_account_info();
        let master_edition = &self.master_edition.to_account_info();
        let mint = &self.mint.to_account_info();
        let authority = &self.mint_authority.to_account_info();
        let payer = &self.owner.to_account_info();
        let system_program = &self.system_program.to_account_info();
        let spl_token_program = &self.token_program.to_account_info();
        let spl_metadata_program = &self.token_metadata_program.to_account_info();

        let seeds = &[&b"authority"[..], &[bumps.mint_authority]];
        let signer_seeds = &[&seeds[..]];

        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = MintTo {
            mint: self.mint.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.mint_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        mint_to(cpi_ctx, 1)?;
        msg!("Collection NFT minted!");

        let creator = vec![Creator {
            address: self.mint_authority.key().clone(),
            verified: true,
            share: metadata_args.creator_share,
        }];

        let metadata_account = CreateMetadataAccountV3Cpi::new(
            spl_metadata_program,
            CreateMetadataAccountV3CpiAccounts {
                metadata,
                mint,
                mint_authority: authority,
                payer,
                update_authority: (authority, true),
                system_program,
                rent: None,
            },
            CreateMetadataAccountV3InstructionArgs {
                data: DataV2 {
                    name: metadata_args.name,
                    symbol: metadata_args.symbol,
                    uri: metadata_args.uri,
                    seller_fee_basis_points: metadata_args.seller_fee_basis_points,
                    creators: Some(creator),
                    collection: None,
                    uses: None,
                },
                is_mutable: true,
                collection_details: Some(CollectionDetails::V1 { size: 0 }),
            },
        );
        metadata_account.invoke_signed(signer_seeds)?;
        msg!("Metadata Account created!");

        let master_edition_account = CreateMasterEditionV3Cpi::new(
            spl_metadata_program,
            CreateMasterEditionV3CpiAccounts {
                edition: master_edition,
                update_authority: authority,
                mint_authority: authority,
                mint,
                payer,
                metadata,
                token_program: spl_token_program,
                system_program,
                rent: None,
            },
            CreateMasterEditionV3InstructionArgs {
                max_supply: Some(0),
            },
        );
        master_edition_account.invoke_signed(signer_seeds)?;
        msg!("Master Edition Account created");

        Ok(())
    }
}
