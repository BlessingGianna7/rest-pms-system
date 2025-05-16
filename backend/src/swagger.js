// src/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title:       'Vehicle Parking Management System API',
    version:     '1.0.0',
    description: 'API for managing users, authentication, vehicles, parking slots, slot requests, and logs'
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local server' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type:         'http',
        scheme:       'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      // --- Reusable Schemas ---
      Error: {
        type:       'object',
        properties: {
          error:   { type: 'string' },
          details: { type: 'string' }
        }
      },
      PaginationMeta: {
        type:       'object',
        properties: {
          totalItems:  { type: 'integer', example: 50 },
          currentPage: { type: 'integer', example: 1 },
          totalPages:  { type: 'integer', example: 5 },
          limit:       { type: 'integer', example: 10 }
        }
      },
      // Auth
      RegisterRequest: {
        type:       'object',
        required:   ['name','email','password'],
        properties: {
          name:     { type: 'string', example: 'John Doe' },
          email:    { type: 'string', example: 'user@example.com' },
          password: { type: 'string', example: 'Password123' }
        }
      },
      RegisterResponse: {
        type:       'object',
        properties: {
          message:{ type:'string', example:'User registered, OTP sent' },
          userId: { type:'integer', example:1 }
        }
      },
      VerifyOtpRequest: {
        type:       'object',
        required:   ['userId','otpCode'],
        properties: {
          userId:  { type:'integer', example:1 },
          otpCode: { type:'string', example:'123456' }
        }
      },
      ResendOtpRequest: {
        type:       'object',
        required:   ['userId'],
        properties: {
          userId: { type:'integer', example:1 }
        }
      },
      LoginRequest: {
        type:       'object',
        required:   ['email','password'],
        properties: {
          email:    { type:'string', example:'user@example.com' },
          password: { type:'string', example:'Password123' }
        }
      },
      AuthResponse: {
        type:       'object',
        properties: {
          token: { type:'string', example:'eyJhbGciOiJI...' },
          user: {
            type:       'object',
            properties: {
              id:    { type:'integer', example:1 },
              name:  { type:'string', example:'John Doe' },
              email: { type:'string', example:'user@example.com' },
              role:  { type:'string', example:'user' }
            }
          }
        }
      },
      // User
      UserProfile: {
        type:       'object',
        properties: {
          id:    { type:'integer', example:1 },
          name:  { type:'string', example:'John Doe' },
          email: { type:'string', example:'john@example.com' },
          role:  { type:'string', example:'user' }
        }
      },
      UpdateProfileRequest: {
        type:       'object',
        properties: {
          name:     { type:'string', example:'Jane Doe' },
          email:    { type:'string', example:'jane@example.com' },
          password: { type:'string', example:'NewPass123' }
        }
      },
      UserListItem: {
        type:       'object',
        properties: {
          id:          { type:'integer', example:1 },
          name:        { type:'string', example:'John Doe' },
          email:       { type:'string', example:'john@example.com' },
          role:        { type:'string', example:'user' },
          is_verified: { type:'boolean', example:true }
        }
      },
      // Vehicle
      VehicleCreateRequest: {
        type:       'object',
        required:   ['plate_number','vehicle_type'],
        properties: {
          plate_number:    { type:'string', example:'ABC123' },
          vehicle_type:    { type:'string', example:'car' },
    
          other_attributes:{ type:'object', example:{color:'blue'} }
        }
      },
      Vehicle: {
        type:       'object',
        properties: {
          id:               { type:'integer', example:1 },
          user_id:          { type:'integer', example:1 },
          license_plate:    { type:'string', example:'ABC123' },
          type:             { type:'string', example:'car' },
   
          other_attributes: { type:'object' },
          approval_status:  { type:'string', nullable:true, example:'approved' }
        }
      },
      // Parking Slot
      ParkingSlotCreate: {
        type:       'object',
        required:   ['slot_number','vehicle_type','location'],
        properties: {
          slot_number:  { type:'integer', example:101 },
      
          vehicle_type: { type:'string', example:'car' },
          location:     { type:'string', example:'north' }
        }
      },
      ParkingSlot: {
        type:       'object',
        properties: {
          id:           { type:'integer', example:1 },
          slot_number:  { type:'integer', example:101 },

          vehicle_type: { type:'string', example:'car' },
          status:       { type:'string', example:'available' },
          location:     { type:'string', example:'north' }
        }
      },
      BulkSlotsRequest: {
        type:       'object',
        required:   ['slots'],
        properties: {
          slots: {
            type:  'array',
            items: { $ref:'#/components/schemas/ParkingSlotCreate' }
          }
        }
      },
      // Slot Request
    SlotRequestCreate: {
  type: 'object',
  required: ['vehicle_id'],
  properties: {
    vehicle_id: { type: 'integer', example: 1 },
    slot_id:    { type: 'integer', example: 3 }
  }
},
SlotRequest: {
  type: 'object',
  properties: {
    id:             { type: 'integer', example: 1 },
    user_id:        { type: 'integer', example: 1 },
    vehicle_id:     { type: 'integer', example: 1 },
    slot_id:        { type: 'integer', nullable: true },
    request_status: { type: 'string', example: 'pending' },
    requested_at:   { type: 'string', format: 'date-time' },
    approved_at:    { type: 'string', format: 'date-time', nullable: true },
    plate_number:   { type: 'string', example: 'ABC123' },
    vehicle_type:   { type: 'string', example: 'car' }
  }
},
ApproveRejectResponse: {
  type: 'object',
  properties: {
    message:     { type: 'string', example: 'Request approved' },
    slot:        { $ref: '#/components/schemas/ParkingSlot' },
    emailStatus: { type: 'string', example: 'sent' }
  }
}
    }
  },
  paths: {
    // --- Auth ---
    '/api/auth/register': {
      post: {
        tags:        ['Auth'],
        summary:     'Register a new user with OTP',
        requestBody: { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/RegisterRequest' } } } },
        responses: {
          '201': { description:'Created', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/RegisterResponse' } } } },
          '400': { description:'Bad Request', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } },
          '500': { description:'Server Error', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/auth/verify-otp': {
      post: {
        tags:        ['Auth'],
        summary:     'Verify OTP for registration',
        requestBody: { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/VerifyOtpRequest' } } } },
        responses: {
          '200': { description:'OK' },
          '400': { description:'Invalid/Expired OTP', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } },
          '500': { description:'Server Error', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/auth/resend-otp': {
      post: {
        tags:        ['Auth'],
        summary:     'Resend registration OTP',
        requestBody: { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/ResendOtpRequest' } } } },
        responses: {
          '200': { description:'OK' },
          '400': { description:'Bad Request', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } },
          '500': { description:'Server Error', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags:        ['Auth'],
        summary:     'Login user',
        requestBody: { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/LoginRequest' } } } },
        responses: {
          '200': { description:'OK', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/AuthResponse' } } } },
          '401': { description:'Unauthorized', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } },
          '403': { description:'Forbidden',    content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } },
          '500': { description:'Server Error', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } }
        }
      }
    },

    // --- Users ---
    '/api/users/profile': {
      get: {
        tags:        ['Users'],
        security:    [{ bearerAuth: [] }],
        summary:     'Get authenticated user profile',
        responses: {
          '200': { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/UserProfile' } } } },
          '401': { description:'Unauthorized' },
          '500': { description:'Server Error' }
        }
      },
      put: {
        tags:        ['Users'],
        security:    [{ bearerAuth: [] }],
        summary:     'Update authenticated user profile',
        requestBody: { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/UpdateProfileRequest' } } } },
        responses: {
          '200': { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/UserProfile' } } } },
          '400': { description:'Bad Request', content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/Error' } } } },
          '401': { description:'Unauthorized' }
        }
      }
    },
    '/api/users': {
      get: {
        tags:        ['Users'],
        security:    [{ bearerAuth: [] }],
        summary:     'List all users (admin only)',
        parameters: [
          { name:'page',  in:'query', schema:{ type:'integer', default:1 } },
          { name:'limit', in:'query', schema:{ type:'integer', default:10 } },
          { name:'search',in:'query', schema:{ type:'string' } }
        ],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type:       'object',
                  properties: {
                    data: { type:'array', items:{ $ref:'#/components/schemas/UserListItem' } },
                    meta:{ $ref:'#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          },
          '403': { description:'Forbidden' },
          '500': { description:'Server Error' }
        }
      }
    },
    '/api/users/{id}': {
      delete: {
        tags:        ['Users'],
        security:    [{ bearerAuth: [] }],
        summary:     'Delete a user (admin only)',
        parameters: [
          { name:'id', in:'path', required:true, schema:{ type:'integer' } }
        ],
        responses: {
          '200': { description:'User deleted' },
          '404': { description:'Not found' },
          '403': { description:'Forbidden' },
          '500': { description:'Server Error' }
        }
      }
    },

    // --- Vehicles ---

'/api/vehicles': {
  post: {
    tags:        ['Vehicles'],
    security:    [{ bearerAuth: [] }],
    summary:     'Create vehicle',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['license_plate', 'type'],
            properties: {
              license_plate: { type: 'string', example: 'RAB234' },
              type:          { type: 'string', example: 'car' }
            }
          }
        }
      }
    },
    responses: {
      '201': {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id:            { type: 'integer', example: 1 },
                license_plate: { type: 'string', example: 'RAB234' },
                type:          { type: 'string', example: 'car' }
              }
            }
          }
        }
      },
      '400': { description: 'Bad Request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
    }
  },
  get: {
    tags:     ['Vehicles'],
    security: [{ bearerAuth: [] }],
    summary:  'List vehicles',
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
      { name: 'search', in: 'query', schema: { type: 'string' } }
    ],
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id:            { type: 'integer', example: 1 },
                      license_plate: { type: 'string', example: 'RAB234' },
                      owner_id:      { type: 'integer', example: 4 },
                      type:          { type: 'string', example: 'car' }
                    }
                  }
                },
                meta: { $ref: '#/components/schemas/PaginationMeta' }
              }
            }
          }
        }
      },
      '500': { description: 'Server Error' }
    }
  }
},
'/api/vehicles/{id}': {
  put: {
    tags:     ['Vehicles'],
    security: [{ bearerAuth: [] }],
    summary:  'Update vehicle',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              license_plate: { type: 'string', example: 'RAB234' },
              owner_id:      { type: 'integer', example: 4 },
              type:          { type: 'string', example: 'car' }
            }
          }
        }
      }
    },
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id:            { type: 'integer', example: 1 },
                license_plate: { type: 'string', example: 'RAB234' },
                owner_id:      { type: 'integer', example: 4 },
                type:          { type: 'string', example: 'car' }
              }
            }
          }
        }
      },
      '404': { description: 'Not found' },
      '400': { description: 'Bad Request' }
    }
  },
  delete: {
    tags:     ['Vehicles'],
    security: [{ bearerAuth: [] }],
    summary:  'Delete vehicle',
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
    ],
    responses: {
      '200': { description: 'Deleted' },
      '404': { description: 'Not found' }
    }
  }
},


    // --- Parking Slots ---
    '/api/parking-slots/bulk': {
      post: {
        tags:        ['Parking Slots'],
        security:    [{ bearerAuth: [] }],
        summary:     'Bulk-create parking slots (admin only)',
        requestBody: { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/BulkSlotsRequest' } } } },
        responses: {
          '201': {
            content: {
              'application/json': {
                schema: {
                  type:  'array',
                  items: { $ref:'#/components/schemas/ParkingSlot' }
                }
              }
            }
          },
          '400': { description:'Bad Request' }
        }
      }
    },
    '/api/parking-slots': {
      get: {
        tags:        ['Parking Slots'],
        security:    [{ bearerAuth: [] }],
        summary:     'List parking slots',
        parameters: [
          { name:'page',  in:'query', schema:{ type:'integer', default:1 } },
          { name:'limit', in:'query', schema:{ type:'integer', default:10 } },
          { name:'search',in:'query', schema:{ type:'string' } }
        ],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type:       'object',
                  properties: {
                    data: { type:'array', items:{ $ref:'#/components/schemas/ParkingSlot' } },
                    meta:{ $ref:'#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          },
          '500': { description:'Server Error' }
        }
      }
    },
    '/api/parking-slots/{id}': {
      put: {
        tags:        ['Parking Slots'],
        security:    [{ bearerAuth: [] }],
        summary:     'Update parking slot (admin only)',
        parameters: [
          { name:'id', in:'path', required:true, schema:{ type:'integer' } }
        ],
        requestBody: { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/ParkingSlotCreate' } } } },
        responses: {
          '200': { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/ParkingSlot' } } } },
          '400': { description:'Bad Request' },
          '404': { description:'Not found' }
        }
      },
      delete: {
        tags:        ['Parking Slots'],
        security:    [{ bearerAuth: [] }],
        summary:     'Delete parking slot (admin only)',
        parameters: [
          { name:'id', in:'path', required:true, schema:{ type:'integer' } }
        ],
        responses: {
          '200': { description:'Deleted' },
          '404': { description:'Not found' }
        }
      }
    },

    // --- Slot Requests ---
    '/api/slot-requests': {
      post: {
        tags:        ['Slot Requests'],
        security:    [{ bearerAuth: [] }],
        summary:     'Create slot request',
        requestBody: { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/SlotRequestCreate' } } } },
        responses: {
          '201': { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/SlotRequest' } } } },
          '404': { description:'Vehicle not found' },
          '500': { description:'Server Error' }
        }
      },
      get: {
        tags:        ['Slot Requests'],
        security:    [{ bearerAuth: [] }],
        summary:     'List slot requests',
        parameters: [
          { name:'page',  in:'query', schema:{ type:'integer', default:1 } },
          { name:'limit', in:'query', schema:{ type:'integer', default:10 } },
          { name:'search',in:'query', schema:{ type:'string' } }
        ],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type:       'object',
                  properties: {
                    data: { type:'array', items:{ $ref:'#/components/schemas/SlotRequest' } },
                    meta:{ $ref:'#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/slot-requests/{id}': {
      put: {
        tags:        ['Slot Requests'],
        security:    [{ bearerAuth: [] }],
        summary:     'Update slot request',
        parameters: [
          { name:'id', in:'path', required:true, schema:{ type:'integer' } }
        ],
        requestBody: { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/SlotRequestCreate' } } } },
        responses: {
          '200': { content:{ 'application/json':{ schema:{ $ref:'#/components/schemas/SlotRequest' } } } },
          '404': { description:'Not found or not editable' }
        }
      },
      delete: {
        tags:        ['Slot Requests'],
        security:    [{ bearerAuth: [] }],
        summary:     'Delete slot request',
        parameters: [
          { name:'id', in:'path', required:true, schema:{ type:'integer' } }
        ],
        responses: {
          '200': { description:'Deleted' },
          '404': { description:'Not found or not deletable' }
        }
      }
    },
    '/api/slot-requests/{id}/approve': {
      put: {
        tags:        ['Slot Requests'],
        security:    [{ bearerAuth: [] }],
        summary:     'Approve slot request (admin only)',
        parameters: [
          { name:'id', in:'path', required:true, schema:{ type:'integer' } }
        ],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema:{ $ref:'#/components/schemas/ApproveRejectResponse' }
              }
            }
          },
          '400': { description:'No slots available' },
          '403': { description:'Forbidden' },
          '404': { description:'Not found or already processed' }
        }
      }
    },
    '/api/slot-requests/{id}/reject': {
      put: {
        tags:        ['Slot Requests'],
        security:    [{ bearerAuth: [] }],
        summary:     'Reject slot request (admin only)',
        parameters: [
          { name:'id', in:'path', required:true, schema:{ type:'integer' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type:       'object',
                required:   ['reason'],
                properties: {
                  reason: { type:'string', example:'No compatible slots' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            content: {
              'application/json': {
                schema:{ $ref:'#/components/schemas/ApproveRejectResponse' }
              }
            }
          },
          '400': { description:'Reason required' },
          '403': { description:'Forbidden' },
          '404': { description:'Not found or already processed' }
        }
      }
    },

    // --- Logs ---
    '/api/logs': {
      get: {
        tags:        ['Logs'],
        security:    [{ bearerAuth: [] }],
        summary:     'List activity logs (admin only)',
        parameters: [
          { name:'page',  in:'query', schema:{ type:'integer', default:1 } },
          { name:'limit', in:'query', schema:{ type:'integer', default:10 } },
          { name:'search',in:'query', schema:{ type:'string' } }
        ],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type:       'object',
                  properties: {
                    data: { type:'array', items:{
                      type:'object',
                      properties:{
                        id:         { type:'integer' },
                        user_id:    { type:'integer' },
                        action:     { type:'string' },
                        created_at: { type:'string','format':'date-time' }
                      }
                    }},
                    meta:{ $ref:'#/components/schemas/PaginationMeta' }
                  }
                }
              }
            }
          },
          '403': { description:'Forbidden' },
          '500': { description:'Server Error' }
        }
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis:       [] // no inline JSDoc needed
};

module.exports = swaggerJsdoc(options);
