package com.vendorconnect.application.usecase.project

import com.vendorconnect.application.port.outbound.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class ProjectStructureUseCase(
    private val projectUseCase: ProjectUseCase,
    private val query: ProjectStructureQueryPort
) {
    fun sections(projectId: UUID): List<ProjectSectionView> = verified(projectId) { query.sections(projectId) }
    fun workPackages(projectId: UUID): List<ProjectWorkPackageView> = verified(projectId) { query.workPackages(projectId) }
    fun corridor(projectId: UUID): List<CorridorSegmentView> = verified(projectId) { query.corridor(projectId) }
    fun continuityGaps(projectId: UUID): List<ContinuityGapView> = verified(projectId) { query.continuityGaps(projectId) }

    private fun <T> verified(projectId: UUID, load: () -> T): T {
        projectUseCase.getById(projectId)
        return load()
    }
}
