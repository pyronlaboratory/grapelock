use anchor_lang::prelude::*;

#[error_code]
pub enum GrpxProtocolError {
    #[msg("Unauthorized action.")]
    Unauthorized,

    #[msg("Invalid wine metadata.")]
    InvalidMetadata,

    #[msg("Collection already verified.")]
    AlreadyVerified,
}
