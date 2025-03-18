CREATE TABLE shift_removal_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique request ID
    shift_id UUID NOT NULL,                               -- References the shift to be modified
    user_id UUID NOT NULL,                                -- User being removed from the shift
    requested_by UUID NOT NULL,                           -- Who requested the removal
    status VARCHAR(50) NOT NULL DEFAULT 'pending',        -- Status: 'pending', 'approved', 'rejected'
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- Timestamp when the request was made
    approved_by UUID,                                     -- Admin who approves/rejects (NULL until approved/rejected)
    approval_time TIMESTAMP,                              -- Timestamp of approval/rejection (NULL until processed)
    FOREIGN KEY (shift_id) REFERENCES active_shifts(shift_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES account(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES account(user_id) ON DELETE SET NULL
);