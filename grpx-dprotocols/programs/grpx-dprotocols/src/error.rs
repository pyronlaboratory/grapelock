use anchor_lang::prelude::*;

#[error_code]
pub enum GrpxProtocolError {
    #[msg("Unauthorized action.")]
    Unauthorized,

    #[msg("Invalid wine metadata.")]
    InvalidMetadata,

    #[msg("Collection already verified.")]
    AlreadyVerified,

    #[msg("Offer has invalid status for this operation")]
    InvalidOfferStatus,

    #[msg("Only the taker can confirm the delivery")]
    UnauthorizedConfirmation,

    #[msg("Only the taker can request a refund")]
    UnauthorizedRefund,

    #[msg("The offer has already been completed or refunded")]
    OfferAlreadySettled,
}
