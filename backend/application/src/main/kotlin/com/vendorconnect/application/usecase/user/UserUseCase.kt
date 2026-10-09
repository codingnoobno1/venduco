package com.vendorconnect.application.usecase.user

import com.vendorconnect.application.port.outbound.UserRepositoryPort
import com.vendorconnect.domain.shared.EntityNotFoundException
import com.vendorconnect.domain.user.User
import org.springframework.stereotype.Service
import java.util.UUID

/** Read access to users. Changes go through [UserAdminUseCase]. */
@Service
class UserUseCase(
    private val userRepository: UserRepositoryPort
) {

    fun getById(id: UUID): User {
        return userRepository.findById(id)
            ?: throw EntityNotFoundException("User", id)
    }

    fun getByEmail(email: String): User {
        return userRepository.findByEmail(email)
            ?: throw EntityNotFoundException("User", email)
    }

    fun listAll(): List<User> {
        return userRepository.findAll()
    }
}
