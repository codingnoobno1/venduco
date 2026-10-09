package com.vendorconnect.persistence.jpa.jdbc

import com.vendorconnect.application.port.outbound.BidRepositoryPort
import com.vendorconnect.application.port.outbound.TenderAward
import com.vendorconnect.domain.account.SubjectRef
import com.vendorconnect.domain.account.SubjectType
import com.vendorconnect.domain.shared.Money
import com.vendorconnect.domain.tender.Bid
import com.vendorconnect.domain.tender.BidQuotation
import com.vendorconnect.domain.tender.BidStatus
import com.vendorconnect.domain.tender.TenderLine
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Component
import java.time.Instant
import java.util.Currency
import java.util.UUID

@Component
class BidRepositoryAdapter(private val jdbc: JdbcTemplate) : BidRepositoryPort {

    private val mapper = RowMapper { rs, _ ->
        val currency = Currency.getInstance(rs.getString("currency"))
        Bid(
            id = UUID.fromString(rs.getString("id")),
            tenderId = UUID.fromString(rs.getString("tender_id")),
            bidder = SubjectRef(SubjectType.valueOf(rs.getString("subject_type")), UUID.fromString(rs.getString("subject_id"))),
            status = BidStatus.valueOf(rs.getString("status")),
            // getLong returns 0 for NULL, so "no amount yet" has to be read through wasNull.
            amount = rs.getLong("amount_minor").let { if (rs.wasNull()) null else Money.ofMinorUnits(it, currency) },
            validityDays = rs.getInt("validity_days").let { if (rs.wasNull()) null else it },
            note = rs.getString("note"),
            quotation = rs.getString("quotation_storage_path")?.let { path ->
                BidQuotation(
                    fileName = rs.getString("quotation_file_name"),
                    contentType = rs.getString("quotation_content_type"),
                    sizeBytes = rs.getLong("quotation_size_bytes"),
                    storagePath = path,
                    uploadedAt = Instant.parse(rs.getString("quotation_uploaded_at"))
                )
            },
            submittedBy = rs.getString("submitted_by")?.let(UUID::fromString),
            submittedAt = rs.getString("submitted_at")?.let(Instant::parse),
            createdAt = Instant.parse(rs.getString("created_at")),
            updatedAt = Instant.parse(rs.getString("updated_at"))
        )
    }

    override fun save(bid: Bid): Bid {
        val q = bid.quotation
        jdbc.update(
            """INSERT INTO bids (id, tender_id, subject_type, subject_id, status, amount_minor, currency, validity_days, note,
                   quotation_file_name, quotation_content_type, quotation_size_bytes, quotation_storage_path, quotation_uploaded_at,
                   submitted_by, submitted_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET status = excluded.status, amount_minor = excluded.amount_minor,
                   currency = excluded.currency, validity_days = excluded.validity_days, note = excluded.note,
                   quotation_file_name = excluded.quotation_file_name, quotation_content_type = excluded.quotation_content_type,
                   quotation_size_bytes = excluded.quotation_size_bytes, quotation_storage_path = excluded.quotation_storage_path,
                   quotation_uploaded_at = excluded.quotation_uploaded_at, submitted_by = excluded.submitted_by,
                   submitted_at = excluded.submitted_at, updated_at = excluded.updated_at""",
            bid.id.toString(), bid.tenderId.toString(), bid.bidder.type.name, bid.bidder.id.toString(), bid.status.name,
            bid.amount?.toMinorUnits(), (bid.amount?.currency ?: Money.INR).currencyCode, bid.validityDays, bid.note,
            q?.fileName, q?.contentType, q?.sizeBytes, q?.storagePath, q?.uploadedAt?.toString(),
            bid.submittedBy?.toString(), bid.submittedAt?.toString(), bid.createdAt.toString(), bid.updatedAt.toString()
        )
        return bid
    }

    override fun find(tenderId: UUID, bidder: SubjectRef): Bid? =
        jdbc.query("SELECT * FROM bids WHERE tender_id = ? AND subject_type = ? AND subject_id = ?", mapper,
            tenderId.toString(), bidder.type.name, bidder.id.toString()).firstOrNull()

    override fun findByBidder(bidder: SubjectRef): List<Bid> =
        jdbc.query("SELECT * FROM bids WHERE subject_type = ? AND subject_id = ?", mapper, bidder.type.name, bidder.id.toString())

    override fun findByTender(tenderId: UUID): List<Bid> =
        jdbc.query("SELECT * FROM bids WHERE tender_id = ? ORDER BY submitted_at", mapper, tenderId.toString())

    override fun saveAward(award: TenderAward) {
        jdbc.update("INSERT INTO tender_awards (tender_id, bid_id, reason, awarded_by, awarded_at) VALUES (?, ?, ?, ?, ?)",
            award.tenderId.toString(), award.bidId.toString(), award.reason, award.awardedBy.toString(), award.awardedAt.toString())
    }

    override fun findAward(tenderId: UUID): TenderAward? =
        jdbc.query("SELECT * FROM tender_awards WHERE tender_id = ?", { rs, _ ->
            TenderAward(UUID.fromString(rs.getString("tender_id")), UUID.fromString(rs.getString("bid_id")), rs.getString("reason"),
                UUID.fromString(rs.getString("awarded_by")), Instant.parse(rs.getString("awarded_at")))
        }, tenderId.toString()).firstOrNull()

    override fun markTenderAwarded(tenderId: UUID) {
        jdbc.update("UPDATE tenders SET status = 'AWARDED', updated_at = ? WHERE id = ?", Instant.now().toString(), tenderId.toString())
    }

    override fun assignPackageContractor(packageId: UUID, organizationId: UUID) {
        jdbc.update("UPDATE corridor_packages SET contractor_id = ? WHERE id = ?", organizationId.toString(), packageId.toString())
    }

    override fun findTenderLines(tenderId: UUID): List<TenderLine> =
        jdbc.query("SELECT description, quantity, unit FROM tender_items WHERE tender_id = ? ORDER BY rowid", { rs, _ ->
            TenderLine(rs.getString("description"), rs.getLong("quantity"), rs.getString("unit"))
        }, tenderId.toString())
}
